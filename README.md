# PomoVault

Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.

PomoVault is an Obsidian plugin that creates a focused execution note, reads tasks from a configured markdown source, runs Pomodoro sessions, and writes a minimal session ledger back into the vault.

## Development Status

This repository contains the v1 plugin implementation, static product site, and release checklist.

## Development

```bash
npm install
npm test
npm run build
```

The website lives in `site/` and deploys as a static GitHub Pages site for `pomovault.com`.

## Task Syntax

```markdown
- [ ] Draft launch post 📅 2026-05-04 🛫 2026-05-03 ⏫
- [ ] Recurring review 🔁 every week 🔼
- [x] Completed task ✅ 2026-05-02
```

## Log Syntax

```markdown
## 2026-05-02

- 09:00-09:25 | Work | 25m | Completed | Draft launch post
```

## More Docs

- [Development](docs/development.md)
- [Release checklist](docs/release-checklist.md)
