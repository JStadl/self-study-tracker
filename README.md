# Self-Study Tracker

A small static site that adds structure to free online courses: a schedule with due dates, progress tracking, solutions that stay locked until you submit, self-marking with real grade weights, timed exams, a timeline, and confetti.

It is one HTML file with no build step and no dependencies. It runs on GitHub Pages. Anyone can view your tracker; only you can edit it.

This repository is an empty template. It ships with no courses and no progress. Two worked example courses are in `examples/courses`.

## What it does

- **Schedule:** every lecture, problem set and exam gets a due date from a pace you choose, per course.
- **Progress:** a Today view with what is due this week, overdue counts and your grade so far.
- **Honesty friction:** solutions links are hidden until you submit and confirm you attempted the work. Assessments are locked in order, and you can run at most two lectures ahead of an unsubmitted one. Skipping is allowed and scores 0%.
- **Marking:** you mark your own work against the published solutions and enter a percentage. Grades use each course's weights.
- **Timeline:** planned versus done, by week, for every course.

## Quick start

1. Make your own copy with **Use this template** or by forking. Keep it public so GitHub Pages can serve it on a free account. Either way you can pull in later code updates; see "Updating from the template".
2. Add a course (see below), or copy the two examples: move the files from `examples/courses` into `courses` and list them in `courses/index.json`:
   ```json
   ["14-01-microeconomics-fall-2023.json", "14-02-macroeconomics-spring-2023.json"]
   ```
3. In the repository, open Settings, then Pages, and deploy from the `main` branch, root folder.
4. Open `https://<user>.github.io/<repo>/`. It is read-only until you sign in.
5. Create a fine-grained personal access token (GitHub Settings, Developer settings, Personal access tokens, Fine-grained tokens) with access to **only this repository** and the permission **Contents: Read and write**.
6. On the site, open the Plan tab, paste the token under Owner and sign in.

GitHub's settings pages change from time to time, so menu names may differ slightly.

## Extending it with an AI assistant

The repository is set up so an AI coding assistant can extend it. `AGENTS.md` gives it the file formats, the rules to keep and a test to run. Open your copy with your assistant and ask for what you need, for example:

- "Add this course to the tracker: `<link to the syllabus or course page>`."
- "Add a shared weekly hours budget across all courses."
- "Add an item type for projects that are marked against a rubric."
- "Change the locking rule so I can run four lectures ahead."

Check what it produces. In particular, check that problem sets sit after the lectures they depend on, and that grade weights match the syllabus.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole app. Contains no course data. |
| `config.json` | Site title and default pace. |
| `courses/index.json` | The course files to load, in tab order. Empty in the template. |
| `courses/*.json` | One file per course. |
| `examples/courses/` | Two complete example course files. |
| `state.json` | Your progress. The app rewrites it through the GitHub API. |
| `tests/smoke.js` | A dependency-free test: `node tests/smoke.js`. |
| `AGENTS.md` | Instructions for AI assistants (and a good map for humans). |
| `CHANGELOG.md` | What changed in each code version. |
| `LICENSING.md` | Who owns what, and what you may copy. |

## Adding a course by hand

1. Copy a file from `examples/courses` into `courses` and edit it.
2. Add its file name to `courses/index.json`.
3. Run `node tests/smoke.js`, then commit.

Course fields:

| Field | Meaning |
|---|---|
| `schema` | Course-file format version. Currently `1`. |
| `id` | Short unique id: lowercase letters, digits and hyphens. Used in the URL (`#id`). Not `today`, `timeline` or `plan`. |
| `code`, `name`, `term` | Shown in the tab and cards. |
| `source`, `sourceUrl`, `license` | Who publishes the materials and under what licence. Shown on the course tab. |
| `pace` | Default units per week (falls back to `config.json`). |
| `links` | Extra links on the course tab: `{"label", "url"}`. |
| `components` | Grade components: `{"key", "label", "weight"}` plus optional `"drop": 1` to drop the lowest score. Weights should sum to 100. |
| `letters` | Optional letter-grade cutoffs, highest first: `[[85,"A"],[75,"B"]]`. |
| `orderNote` | Optional note shown to the owner above the item list. |
| `types` | Optional item types for this course only. See "Item types". |
| `items` | The course in study order. |

Item fields:

| Field | Meaning |
|---|---|
| `id` | Unique across all courses. Progress is keyed by this, so never rename an id once you have used it. |
| `type` | A built-in type (`lecture`, `reading`, `pset`, `exam`) or one you define. See "Item types". |
| `title`, `url` | What to show and where it lives. |
| `n` | Optional number, used in labels (`LEC 03`, `P3`). |
| `short` | Optional short label for the timeline (`Mid`, `Q1`). |
| `solutions` | URL of the solutions, revealed after submitting. Use `null` with `"solutionsInline": true` when the paper only exists with solutions inside. |
| `component` | Which grade component a pset or exam counts towards. |
| `minutes` | Time limit for a timed item (falls back to the type's default). |
| `units` | Work weight for scheduling (falls back to the type's default). One unit is roughly 1 to 1.5 hours. |

Put each problem set where it should be done, after the lectures it depends on. The locking rule uses this order.

## Item types

Item types are data, so a course with a different shape usually needs no code change. Four are built in:

| Type | Mode | Timed | Units | Chip |
|---|---|---|---|---|
| `lecture` | tick | no | 1 | `LEC` |
| `reading` | tick | no | 1 | `READ` |
| `pset` | assess | no | 2 | `PSET` |
| `exam` | assess | yes, 90 min | 2 | `EXAM` |

A `tick` item is ticked off when done. An `assess` item is submitted, then marked against its solutions, and counts towards a grade component.

Define more under `types` in `config.json` (for every course) or in a course file (for that course). A definition with a built-in name changes that type.

```json
"types": {
  "video":   { "mode": "tick",   "label": "VID",  "short": "V", "verb": "Watch", "done": "watched", "units": 1 },
  "project": { "mode": "assess", "label": "PROJ", "open": "Open brief", "units": 6 },
  "quiz":    { "mode": "assess", "label": "QUIZ", "short": "Q", "timed": true, "minutes": 30, "units": 1 }
}
```

| Type field | Meaning |
|---|---|
| `mode` | `tick` or `assess`. Required. |
| `label` | Chip text in lists. |
| `short` | Prefix for timeline labels, combined with the item's `n` (`P3`). |
| `units` | Default work weight. |
| `timed`, `minutes` | For `assess` types: run against a timer, with this default limit. |
| `verb`, `done` | For `tick` types: the link text ("Watch") and the past tense ("watched"). |
| `open` | For `assess` types: the link text ("Open brief"). |

## Updating from the template

Your copy differs from the template in two ways. Your data (`courses/`, `state.json`, `config.json`) is meant to differ and never needs syncing. The code (`index.html`, `tests/`) is what can fall behind.

To pull in newer code without touching your data:

```
git remote add template https://github.com/<template-owner>/<template-repo>.git   # once
git fetch template
git checkout template/main -- index.html tests AGENTS.md LICENSING.md CHANGELOG.md
node tests/smoke.js
git commit -m "Update tracker code from the template"
```

This works whether you forked or used "Use this template". If you forked, GitHub's "Sync fork" button does the same job as long as you have not edited the code files.

Before updating, read `CHANGELOG.md`. The footer of the site shows the code version you are running. Course files carry a `schema` number; if a course file is newer than the code understands, the site says so and does not guess.

To keep updates painless:

- Keep your copy data-only where you can. Prefer a new item type or a course-file field over a code edit.
- If you do change `index.html`, the checkout above will overwrite it. Merge by hand, or offer the change to the template as a pull request so everyone gets it.

## How saving works

- Signed in, each change is committed to `state.json` about 4 seconds after your last action. The commit message says what happened, so `git log` is your study history.
- The token is kept in that browser's local storage and sent only to `api.github.com`. Never commit it. Sign out on the Plan tab to remove it from a browser; revoke it on GitHub to kill it everywhere.
- Visitors read the published `state.json`, so they see changes once Pages redeploys, usually within a minute or two.
- Every save triggers a Pages rebuild. GitHub applies a soft limit on builds per hour, which a normal study session will not reach.
- Your marks and skipped items are visible to anyone who can see the site.

## Run it locally

```
python3 -m http.server
```

Then open `http://localhost:8000`. On localhost the app is fully editable and saves to that browser only. Opening `index.html` straight from disk does not work, because the page fetches its course files.

## Limits

- One editor. Two browsers saving at once will overwrite each other.
- Access control is the token. There are no accounts.
- The locks are friction, not security. The solutions links are in the course files.
- Each course has its own pace. There is no shared weekly budget across courses.
- Self-marking only.

## Licence

The code is MIT-licensed. Course materials are not part of this repository and remain under their publishers' licences. Read `LICENSING.md` before copying any course content into your fork.
