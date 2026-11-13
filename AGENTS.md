# Instructions for AI assistants

You are working on Self-Study Tracker, a static site that tracks a person's progress through free online courses. The owner of this copy has probably asked you to add a course or a feature. This file tells you how the project is built and what must not break.

## Shape of the project

- `index.html` is the entire app: styles, then one script. No build step, no framework, no dependencies, no network requests except the site's own JSON files and `api.github.com`.
- `config.json` holds the site title and default pace.
- `courses/index.json` lists course files; `courses/*.json` are the courses. The app has no course-specific code.
- `state.json` is the owner's progress. The running app writes it through the GitHub contents API. You should almost never edit it.
- `tests/smoke.js` loads the app against a stubbed DOM and a fake GitHub API. Run `node tests/smoke.js` after every change. It validates every course file in `courses/` and `examples/courses/`.

The script in `index.html` starts with a comment listing its sections. Read that first.

## Prefer data over code

This copy may be updated later from an upstream template by overwriting `index.html`. Every code edit you make here is one the owner must re-apply or merge after an update. So, in order of preference:

1. **A course file or `config.json` change.** New course, new item type, different weights, different pace, different title. No code involved.
2. **A small, generic code change** that would suit any user of the template. Tell the owner it is worth offering upstream as a pull request, and add a line to `CHANGELOG.md`.
3. **A change specific to this owner.** Do it only if asked, keep it isolated, and tell the owner plainly that their copy now differs from the template and updates will need a manual merge.

Never edit `index.html` to special-case one course. If a course does not fit, first check whether a custom item type covers it.

## Rules to keep

1. **Never rename or reuse an item `id`.** Progress in `state.json` is keyed by item id. Renaming one silently discards the owner's work on it. Adding and reordering items is safe.
2. **Do not copy course content into the repository.** Store titles and links only. No problem text, solutions, notes or transcripts unless the owner explicitly asks and the source licence allows it; then follow `LICENSING.md` (separate folder, source and licence stated, never labelled MIT).
3. **Do not invent course structure.** Take lecture lists, problem sets, exam dates and grade weights from the course's own pages. If the source does not say where a problem set falls, place it after the lectures it most plausibly depends on, say so in the course's `orderNote`, and tell the owner.
4. **Do not invent URLs.** Every `url` and `solutions` value must be one you actually saw on the provider's site.
5. **Keep it dependency-free and single-file** unless the owner asks otherwise. No CDN scripts, web fonts, analytics or build tooling.
6. **Never put a token or secret in the repository.** The owner's GitHub token lives only in their browser.
7. **Keep `state.json` backward compatible.** If you add fields, old files without them must still load. Bump nothing; default missing fields in `norm()`.
8. **Fill in `source`, `sourceUrl` and `license`** for every course you add, and do not use a provider's name or logo in the site title or branding.
9. **Version the formats.** If you change what a course file may contain in a way old code would misread, raise `SCHEMA` in `index.html`, set `"schema"` in the course files that need it, and note it in `CHANGELOG.md`. Additive optional fields do not need a bump. Raise `VERSION` on any code change.
10. **Read-only mode must stay read-only.** Visitors without a token must see no action buttons. `canEdit()` gates this.

## Recipe: add a course

1. Ask the owner for the course page or syllabus link if you do not have it. Fetch the syllabus, the calendar or schedule, and the pages listing lectures, assignments and exams.
2. Create `courses/<slug>.json`. Start from a file in `examples/courses`.
3. Choose a short `id` (lowercase letters, digits, hyphens; not `today`, `timeline` or `plan`). Prefix every item id with it, for example `algo-l1`, `algo-p1`, `algo-final`.
4. List `items` in the order they should be studied. Put each problem set after the last lecture it needs. Put exams where the syllabus puts them.
5. Set `components` from the syllabus grading section. Weights should sum to 100. Use `"drop": 1` when the lowest score is dropped. Give each `pset` and `exam` item a `component` that matches a component `key`.
6. For each assessment, set `solutions` to the solutions URL. If the only published paper has solutions inside it, set `"solutions": null` and `"solutionsInline": true`. If there are no solutions at all, tell the owner; the submit-then-mark flow has nothing to mark against.
7. Set `minutes` on exams from the syllabus. If it is not stated, leave the default and tell the owner.
8. Add the file name to `courses/index.json`.
9. If the course has work that is not a lecture, reading, problem set or exam (videos, projects, labs, short quizzes), define an item type for it under `types` in the course file. See "Item types" in `README.md`. Do not edit code for this.
10. Run `node tests/smoke.js`.
11. Report to the owner: what you added, anything you could not find, and every placement or duration you estimated.

Field reference: see the tables in `README.md`. The loader that enforces them is `normCourse()` in `index.html`.

## Recipe: change behaviour

| To change | Look at |
|---|---|
| How due dates are computed | `makePlan()` |
| What is locked and why | `lockedBy()` |
| How grades are calculated | `grade()` |
| What a row shows and which buttons it has | `row()` |
| What a button does | `act()` |
| A new item type | No code: add it under `types` in `config.json` or the course file |
| A new kind of behaviour for item types (beyond tick and assess) | `TYPES`, `mergeTypes()`, `isTick()`, `isTimed()`, then `row()` and `act()` |
| The timeline chart | `viewTimeline()` |
| Where progress is stored | the storage section: `boot()`, `flush()`, `signIn()` |

Rendering is a pure function of `COURSES`, `state` and today's date: every action mutates `state` through `change()` and the page is rebuilt as a string. Keep it that way. Derived values (locks, grades, overdue counts) are computed on render and never stored.

## State format

```json
{
  "v": 1,
  "updatedAt": 0,
  "items": { "<item id>": { "done": "<ISO time>", "started": "<ISO time>", "submitted": "<ISO time>", "skipped": "<ISO time>", "score": 80 } },
  "plan":  { "<course id>": { "start": "YYYY-MM-DD", "pace": 5, "due": { "<item id>": "YYYY-MM-DD" } } },
  "order": { "<course id>": ["<item id>", "..."] },
  "log":   [ { "t": "<ISO time>", "id": "<item id>", "a": "watch|start|submit|mark|skip|reset|replan" } ]
}
```

Lectures and readings use `done`. Problem sets and exams use `submitted` or `skipped`, then `score` (0 to 100). `order` exists only for courses whose items the owner has moved.

## Testing and debugging

- `node tests/smoke.js` must pass before you finish.
- To look at it in a browser: `python3 -m http.server`, then `http://localhost:8000`. Localhost runs in local mode, editable, saved to that browser only.
- In the browser console, `__tracker.courses()`, `__tracker.state()`, `__tracker.types()`, `__tracker.mode()` and `__tracker.version` show what the app loaded.
- If the page says the course files did not load, the message names the problem (missing file, bad id, duplicate item id).

## What to tell the owner

Be plain about what you verified and what you did not. If you could not run the test, say so. If the test passed but you did not open the page in a browser, say that too. List every value you estimated.
