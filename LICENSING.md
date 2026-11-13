# Licensing, attribution and privacy

This is a plain-language summary of who owns what in this repository. It is not legal advice.

## Summary

| Thing | Licence | Notes |
|---|---|---|
| The tracker's code and documentation | MIT (see `LICENSE`) | Use, fork, modify and redistribute freely; keep the copyright notice. |
| Course files in `examples/courses` | MIT, to the extent they can be copyrighted | They hold only titles, links and grade weights. |
| The course materials those files link to | Their publisher's licence | Not in this repository. Not covered by the MIT licence. |
| Your `state.json` | Yours | Public if your repository is public. |

## The code

Everything in this repository is released under the MIT licence unless a file says otherwise. That covers `index.html`, the tests and the documentation.

There are no third-party libraries, fonts, images or trackers in the code. The page uses the visitor's system fonts and loads nothing from other sites.

Most of the code was written with an AI assistant, directed and reviewed by the author. How copyright applies to AI-assisted code is unsettled in some countries. The MIT licence grants you whatever rights the author holds.

## Course files versus course materials

A course file is a list of titles, links, weights and an order. It points to lectures, problem sets and exams that stay on the publisher's site. Nothing in this repository copies those materials.

The two example files describe courses from MIT OpenCourseWare (OCW):

- 14.01 Principles of Microeconomics, Fall 2023
- 14.02 Principles of Macroeconomics, Spring 2023

Those materials are published by MIT under [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). See the [OCW terms of use](https://ocw.mit.edu/terms). This project is not affiliated with, sponsored by or endorsed by MIT.

## If you copy course content into your fork

Linking needs no licence. Copying or adapting does. If you put actual course content in your repository (problem text, solutions, lecture notes, transcripts, or summaries and rubrics derived from them), the publisher's licence applies to that content. For OCW's CC BY-NC-SA 4.0 that means:

- **Attribution:** credit MIT OpenCourseWare and the course, link to the source, and say if you changed anything.
- **Non-commercial:** no commercial use. OCW's own guidance describes this as excluding profit-making entities that charge for access to educational materials.
- **Share-alike:** anything you build from the content must be shared under the same licence.

In practice:

- Keep copied or adapted content in its own folder with a notice naming the source and its licence. Do not present it as MIT-licensed. The MIT licence on the code and CC BY-NC-SA on content are different licences and cannot be merged into one.
- Some OCW items are marked "all rights reserved". They belong to third parties and are outside the Creative Commons licence. Link to them; do not copy them.
- The OCW terms include specific conditions for using OCW content to train AI models. Read them before doing that.

## Other course providers

Each provider sets its own terms. Before adding a course from another source:

- Check whether the materials are openly licensed. Many free courses are free to watch but not free to copy.
- Prefer links. A link plus a title is the safe default everywhere.
- Check the provider's terms before scraping or bulk-downloading. Some forbid automated access.
- Record the source and licence in the course file's `source`, `sourceUrl` and `license` fields so the tracker can show them.

## Names and trademarks

"MIT", "Massachusetts Institute of Technology", "MIT OpenCourseWare" and their logos belong to MIT. OCW's terms allow using the name for attribution and nothing else without written consent. Do not use a provider's name or logo in your project's name, title or branding, and do not suggest they endorse it. The same applies to any other provider.

## Your data and privacy

- **Progress is public.** `state.json` holds what you completed, when, and your marks. On a public repository anyone can read it and its history.
- **The token stays in your browser.** The owner's GitHub token is kept in that browser's local storage and sent only to `api.github.com`. It is never written to the repository. Use a fine-grained token limited to this one repository with Contents read and write, and use it only on devices you trust.
- **No analytics.** The page sets no cookies and contacts no third parties. A signed-in owner's browser talks to `api.github.com`. Visitors' browsers talk only to the site's own host.
- **GitHub's terms apply** to hosting on GitHub Pages and to use of the GitHub API.

## No warranty

The software is provided as is, as the MIT licence states. Marks and grades it shows are your own self-assessment and carry no academic standing.
