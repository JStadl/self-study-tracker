/*
  Smoke test. No dependencies: node tests/smoke.js
  Loads index.html against a stubbed DOM and a fake GitHub API, with every course file
  from courses/ and examples/courses/, then walks through the main flows.
*/
"use strict";
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const html = read("index.html");
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];

let failed = 0;
const ok = (cond, msg) => { if (cond) console.log("  ok   " + msg); else { failed++; console.log("  FAIL " + msg); } };

/* course files: everything listed in courses/index.json plus every example */
const listed = JSON.parse(read("courses/index.json"));
const files = {};
listed.forEach(f => { files[f] = path.join("courses", f); });
fs.readdirSync(path.join(root, "examples/courses")).filter(f => f.endsWith(".json")).forEach(f => { if (!files[f]) files[f] = path.join("examples/courses", f); });
const names = Object.keys(files);

/* static checks on each course file */
console.log("Course files");
const seenIds = {};
names.forEach(f => {
  let c; try { c = JSON.parse(read(files[f])); } catch (e) { ok(false, f + " is valid JSON"); return; }
  const keys = (c.components || []).map(k => k.key);
  const sum = (c.components || []).reduce((a, k) => a + (+k.weight || 0), 0);
  const dup = (c.items || []).filter(i => { const d = seenIds[i.id]; seenIds[i.id] = 1; return d; }).map(i => i.id);
  const badUrl = (c.items || []).filter(i => i.url && !/^https?:\/\//.test(i.url)).map(i => i.id);
  ok(!!c.id && Array.isArray(c.items) && c.items.length > 0, f + " has an id and items");
  ok(sum === 100, f + " component weights sum to 100 (got " + sum + ")");
  ok(dup.length === 0, f + " item ids are unique" + (dup.length ? ": " + dup.join(", ") : ""));
  ok(badUrl.length === 0, f + " urls are absolute" + (badUrl.length ? ": " + badUrl.join(", ") : ""));
  ok(!!c.source, f + " names its source");
});

/* stubs */
const els = {};
const mk = id => els[id] || (els[id] = { id, textContent: "", innerHTML: "", value: "", checked: true, className: "", addEventListener() {}, getAttribute() { return null; } });
global.document = { title: "", getElementById: mk, querySelectorAll: () => [], querySelector: () => null, createElement: () => ({ setAttribute() {}, remove() {}, getContext: () => ({}) }), body: { appendChild() {} }, activeElement: null };
const store = {};
global.localStorage = { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } };
global.btoa = s => Buffer.from(s, "binary").toString("base64");
global.atob = s => Buffer.from(s, "base64").toString("binary");
let remote = read("state.json"), rsha = "s0"; const puts = [];
global.fetch = async (url, o = {}) => {
  const u = url.replace(/\?t=\d+$/, ""), method = o.method || "GET";
  const json = v => ({ ok: true, status: 200, json: async () => v });
  if (u === "config.json") return json(JSON.parse(read("config.json")));
  if (u === "courses/index.json") return json(names);
  if (u.startsWith("courses/")) return json(JSON.parse(read(files[u.slice(8)])));
  if (u === "state.json") return json(JSON.parse(read("state.json")));
  if (/\/contents\/state\.json/.test(u)) {
    if (method === "GET") return json({ sha: rsha, content: global.btoa(unescape(encodeURIComponent(remote))) });
    const b = JSON.parse(o.body);
    if (b.sha !== rsha) return { ok: false, status: 409, json: async () => ({}) };
    remote = decodeURIComponent(escape(global.atob(b.content))); rsha = "s" + (puts.length + 1); puts.push(b.message);
    return json({ content: { sha: rsha } });
  }
  return json({ permissions: { push: true } });
};
global.location = { hash: "", protocol: "https:", hostname: "someone.github.io", pathname: "/tracker/" };
let hashchange; const win = { addEventListener(t, f) { if (t === "hashchange") hashchange = f; }, scrollTo() {}, matchMedia: () => ({ matches: true }) };
global.window = win;
global.setInterval = () => 0;
const realTimeout = setTimeout, saves = [];
global.setTimeout = (f, ms) => { if (ms === 4000) saves.push(f); return 0; };
global.clearTimeout = () => {};
let click; mk("app").addEventListener = (t, f) => { if (t === "click") click = f; };

eval(js);

const T = win.__tracker, out = () => els.app.innerHTML;
const wait = () => new Promise(r => realTimeout(r, 30));
const go = h => { global.location.hash = "#" + h; hashchange(); };
const fire = (a, id) => click({ target: { closest: () => ({ getAttribute: k => (k === "data-act" ? a : id) }) } });
const flushSaves = () => saves.splice(0).forEach(f => { try { f(); } catch (e) {} });

(async () => {
  await wait();
  console.log("App");
  ok(T.courses().length === names.length, "loads " + names.length + " course file(s)");
  T.courses().forEach(c => {
    const keys = c.comps.map(k => k.key), bad = c.items.filter(i => i.def.mode === "assess" && keys.indexOf(i.comp) < 0).map(i => i.id);
    ok(bad.length === 0, c.id + ": every assessed item counts towards a known grade component" + (bad.length ? ": " + bad.join(", ") : ""));
  });
  ok(T.mode() === "view", "opens read-only without a token");
  ok((out().match(/<button/g) || []).length === 0, "read-only view has no buttons");
  ok(!/NaN|undefined/.test(out()), "Today view renders cleanly");
  go("timeline"); ok(!/NaN|undefined/.test(out()), "Timeline renders cleanly");
  const total = T.courses().reduce((a, c) => a + c.items.length, 0);
  ok((out().match(/<g class="m-/g) || []).length === total, "Timeline has one mark per item (" + total + ")");

  go("plan"); mk("gh-owner").value = "someone"; mk("gh-repo").value = "tracker"; mk("gh-token").value = "token";
  fire("signin", "x"); await wait();
  ok(T.mode() === "owner", "signs in with a token that can push");

  const c = T.courses().find(x => x.items.some(i => i.def.mode === "assess" && !i.def.timed) && x.items.some(i => i.def.mode === "tick"));
  if (c) {
    go(c.id);
    const p = c.items.find(i => i.def.mode === "assess" && !i.def.timed), later = c.items.slice(c.items.indexOf(p) + 1).find(i => i.def.mode === "assess");
    ok(!/Open solutions|with solutions/.test(out().split(p.title)[1].split('class="row')[0]), "solutions are hidden before submitting");
    if (later) ok(new RegExp("Locked until " + p.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(out()), "later assessments are locked behind " + p.title);
    fire("open", p.id); fire("submit", p.id);
    ok(!!T.state().items[p.id].submitted, "submitting records a timestamp");
    mk("score-" + p.id).value = "80"; fire("mark", p.id);
    ok(T.state().items[p.id].score === 80, "marking records the score");
    ok(Math.round(T.grade(c).pct) === 80, "grade so far reflects the mark");
    flushSaves(); await wait();
    ok(puts.length === 1 && /marked 80%/.test(puts[0]), "saves to GitHub with a descriptive commit message");
    rsha = "changed-elsewhere";
    const l = c.items.find(i => i.def.mode === "tick" && !T.state().items[i.id]);
    if (l) { fire("watch", l.id); flushSaves(); await wait(); await wait(); ok(puts.length === 2, "recovers from a stale sha and saves again"); }
    const saved = JSON.parse(remote);
    ok(saved.v === 1 && !!saved.items[p.id] && saved.log.length >= 2, "saved state has items and a log");
    ok(!!saved.plan[c.id] && Object.keys(saved.plan[c.id].due).length > 0, "a plan with due dates is frozen on first action");
  } else {
    console.log("  skip flow checks: no course with both lectures and problem sets");
  }
  /* hostile input: markup in every text field must come out escaped, and bad links and ids must be refused */
  console.log("Hostile course files");
  const X = '"><img src=x onerror=alert(1)>', N = win.__tracker.normCourse, base = () => ({ id: "evil", code: X, name: X, term: X, source: X, license: X, orderNote: X, letters: [[0, X]],
    types: { odd: { mode: "tick", label: X, done: X, verb: X, short: X }, hard: { mode: "assess", label: X, open: X } },
    links: [{ label: X, url: "https://example.org/a\"b" }], components: [{ key: "k", label: X, weight: 100 }],
    items: [{ id: "evil-1", type: "odd", n: 1, title: X, short: X, url: "https://example.org/\"onmouseover=\"x" }, { id: "evil-2", type: "hard", title: X, short: X, url: "https://example.org/p", solutions: "https://example.org/s", component: "k" }] });
  const refuses = (label, edit) => { const c = base(); c.id = "evil" + label.replace(/\W/g, ""); c.items.forEach((i, n) => { i.id = c.id + "-" + n; }); edit(c); let threw = false; try { N(c); } catch (e) { threw = true; } ok(threw, "refuses " + label); };
  refuses("a javascript: link", c => { c.items[0].url = "javascript:alert(1)"; });
  refuses("a data: solutions link", c => { c.items[1].solutions = "data:text/html,x"; });
  refuses("a link with leading whitespace", c => { c.items[0].url = " javascript:alert(1)"; });
  refuses("a non-http sourceUrl", c => { c.sourceUrl = "javascript:alert(1)"; });
  refuses("markup in an item id", c => { c.items[0].id = 'a"><b>'; });
  refuses("a non-numeric n", c => { c.items[0].n = "<b>"; });
  win.__tracker.courses().push(N(base()));
  T.state().items["evil-2"] = { submitted: new Date().toISOString(), score: 50 };
  let leaked = [];
  ["today", "timeline", "evil", "plan"].forEach(v => { go(v); if (/<img|onerror=alert\(1\)>|" ?onmouseover="x"/.test(out())) leaked.push(v); });
  ok(leaked.length === 0, "hostile text is escaped in every view" + (leaked.length ? ": leaked in " + leaked.join(", ") : ""));
  go("evil"); ok(/&lt;img src=x/.test(out()), "the hostile course did render (as text)");
  console.log(failed ? "\n" + failed + " check(s) failed" : "\nAll checks passed");
  process.exit(failed ? 1 : 0);
})();
