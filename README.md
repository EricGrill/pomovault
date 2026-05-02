# ⏱️ PomoVault

> Pomodoro execution for [Obsidian](https://obsidian.md). Tasks, timer, and proof-of-work logs in plain markdown.

[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/ericgrill/pomovault/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Obsidian](https://img.shields.io/badge/Obsidian-1.5.0+-8A2BE2)](https://obsidian.md)

PomoVault is an Obsidian plugin that eliminates the friction between task management and focused work. No more juggling a separate timer, task list, and execution notes — open one page, see what matters most, and start working.

**One plugin. One note. Zero friction.**

Release notes: [CHANGELOG.md](CHANGELOG.md).

---

## ✨ Features

- 🎯 **Single execution note** — `PomoVault.md` is your launchpad. Open it, work, done.
- ▶️ **Built-in Pomodoro timer** — Work / Short Break / Long Break cycles with automatic progression
- 📋 **Smart task list** — Reads from any markdown file in your vault, sorted by urgency and due date
- 🏷️ **Priority badges** — Color-coded urgency indicators (Urgent → Lowest) at a glance
- ✅ **One-click completion** — Mark tasks done inline; updates your source file instantly
- 📝 **Plain markdown logs** — Session history written to `PomoVault Log.md` — no lock-in, ever
- 🔗 **Wikilink support** — `[[Internal Links]]` in tasks render and work normally
- 🔁 **Recurring task markers** — Parses and shows `🔁` recurrence text (display/metadata only). Completing a task does **not** create the next occurrence; that behavior is planned for a later release
- 🔇 **Zero dependencies** — No Tasks plugin, no Dataview, no other timer plugin required
- 📱 **Not desktop-only** — Built with responsive Obsidian UI primitives; validate your theme on mobile before relying on it daily

---

## 📸 Screenshots

The files below are **placeholder diagrams** (not real Obsidian captures). **Maintainers:** replace [`docs/images/pomovault-execution-note-PLACEHOLDER.png`](docs/images/pomovault-execution-note-PLACEHOLDER.png) and [`docs/images/pomovault-session-log-PLACEHOLDER.png`](docs/images/pomovault-session-log-PLACEHOLDER.png) with PNG exports from a vault using PomoVault, then rename/remove the `PLACEHOLDER` suffix and update the paths in this section if needed.

**Execution note** (`PomoVault.md`) — timer, NOW WORKING ON, and task list:

![PomoVault execution note (placeholder layout)](docs/images/pomovault-execution-note-PLACEHOLDER.png)

**Session log** (`PomoVault Log.md`) — work history in plain markdown:

![PomoVault session log (placeholder layout)](docs/images/pomovault-session-log-PLACEHOLDER.png)

---

## 🚀 Quick Start

Until PomoVault is accepted into the Obsidian Community Plugins directory:

1. Download or build `main.js`, `manifest.json`, and `styles.css`
2. Copy them into `.obsidian/plugins/pomovault/` in a test vault
3. Enable PomoVault in Obsidian Community Plugins settings
4. Select your task source file when prompted
5. Open `PomoVault.md` and click **▶️ Start** on your top task

---

## 📝 Task Syntax

PomoVault reads standard markdown task syntax, compatible with (but not requiring) the [Obsidian Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) plugin:

```markdown
- [ ] Draft launch post 📅 2026-05-04 🛫 2026-05-03 ⏫
- [ ] Recurring review 🔁 every week 🔼
- [x] Completed task ✅ 2026-05-02
- [ ] Task with link [[Project Note]] 🔺
```

| Emoji | Meaning |
|---|---|
| 📅 | Due date |
| 🛫 | Start date (hidden until this date) |
| 🔺 | Urgent priority |
| ⏫ | Highest priority |
| 🔼 | High priority |
| 🔽 | Low priority |
| ⏬ | Lowest priority |
| 🔁 | Recurring |
| ✅ | Completion date |

### Recurring tasks

PomoVault reads the **🔁** marker and the human-readable phrase that follows (for example `every week`), shows a ↺ indicator in the task list when that option is enabled, and **keeps that text on the line** when you add tasks or mark them done (only the checkbox and completion date change). It does **not** interpret recurrence rules, roll dates forward, or insert a new task line when you complete a recurring item.

For full recurrence syntax and rule options (including `when done`), see the [Obsidian Tasks recurring tasks guide](https://publish.obsidian.md/tasks/Getting+Started/Recurring+Tasks). PomoVault stays compatible with that markdown shape; use the Tasks plugin if you need automatic next-occurrence generation today.

---

## 📊 Session Logs

Work sessions are recorded automatically in plain markdown:

```markdown
## 2026-05-02

- 09:00–09:25 | Work | 25m | Completed | Draft launch post
- 09:30–09:55 | Work | 25m | Completed | Recurring review
```

Your data stays yours. No proprietary formats, no cloud required.

---

## ⚙️ Configuration

| Setting | Default | Description |
|---|---|---|
| Task source file | *(required)* | The `.md` note PomoVault reads tasks from |
| Work duration | 25 min | Length of work session |
| Short break | 5 min | Length of short break |
| Long break | 15 min | Length of long break |
| Sessions before long break | 4 | Work intervals before a long break |
| Auto-advance | ON | Automatically start next timer in cycle |
| Sound on completion | ON | Play sound when session ends |
| Volume | 70% | Sound volume |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│           PomoVault.md              │  auto-created on install
│       ```pomoblock```               │  plugin renders UI here
└──────────────┬──────────────────────┘
               │ reads/writes via Obsidian vault API
┌──────────────▼──────────────────────┐
│      User's Task Source File        │  any existing .md note
│  - [ ] Task 📅 2026-05-04 ⏫        │  standard markdown tasks
└──────────────┬──────────────────────┘
               │ configured via
┌──────────────▼──────────────────────┐
│         Plugin Settings             │  .obsidian/plugins/pomovault/data.json
└─────────────────────────────────────┘
```

---

## 🛠️ Development

```bash
npm install      # Install dependencies
npm test         # Run test suite
npm run build    # Build the plugin
npm run verify   # Test + build + site build
```

The plugin release files are `main.js`, `manifest.json`, and `styles.css`.

### Website

```bash
npm --prefix site install
npm --prefix site run build
npm --prefix site run preview
```

The website is a static Vite/React/Tailwind app intended for [pomovault.com](https://pomovault.com) via GitHub Pages.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on development setup, coding standards, and submitting changes.

---

## 📄 License

[MIT](LICENSE) © Eric Grill

---

*Built on the Pomodoro Technique® by Francesco Cirillo.*
