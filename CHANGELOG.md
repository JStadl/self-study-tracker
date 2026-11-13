# Changelog

Code version is shown in the site footer. Course-file format version is the `schema` field.

## 1.1.1

Security fix. Update if you run 1.1.0 or earlier.

- Course files and `config.json` are now treated as untrusted. Earlier versions wrote several values (course code, type labels, links) into the page unescaped, so a crafted course file could run script on the page and read the owner's token.
- Links must start with `http://` or `https://`; item ids and numbers are validated on load; every value is escaped on output.
- `tests/smoke.js` loads a hostile course file and checks nothing leaks.
- README gains a "Security model" section.

## 1.1.0

- Item types are data: define or change them under `types` in `config.json` or a course file.
- Course files carry a `schema` number (currently 1). A file newer than the code is refused with a clear message.
- The "already watched lectures 1 to N" shortcut only appears for courses with numbered lectures.

## 1.0.0

- First template release: schedule, progress, locked solutions, self-marking, timed exams, timeline, GitHub-backed saving, read-only public view.
