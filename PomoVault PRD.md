# PomoVault — Product Requirements Document

**Version:** 0.1
**Date:** 2026-05-02
**Website:** pomovault.com
**Platform:** Obsidian Community Plugin
**Status:** Draft

---

## 1. Problem Statement

Pomodoro technique works. Task management in Obsidian works. But combining them creates friction — users juggle a physical timer, a separate task list, multiple plugins, and mental overhead deciding what to work on next. For users with ADHD, that friction is enough to abandon the system entirely.

Existing solutions require:
- 2–3 separate community plugins (Tasks, Dataview, a timer plugin)
- Manual setup of execution notes and DataviewJS queries
- Knowing emoji syntax to set priorities and dates
- Context-switching between task file, execution note, and timer

**PomoVault solves this with one plugin, one note, zero friction.** Open it, see your tasks ranked by urgency, click Start, work.

---

## 2. Users & Use Cases

### Primary User: The ADHD Knowledge Worker
- Struggles with task initiation and prioritization decisions
- Needs the system to make the "what next" decision for them
- Gets distracted mid-session and needs a persistent visual anchor
- Values simplicity — complexity kills adoption

**Job to be done:** "When I sit down to work, I need to immediately know what to do and start doing it without thinking about the system."

### Secondary User: The Obsidian Power User
- Already uses Tasks plugin and has existing task notes
- Wants a Pomodoro execution layer that respects their existing data
- Values compatibility and customization

**Job to be done:** "I want a focused execution mode that plugs into my existing vault without breaking anything."

---

## 3. Core Concept

PomoVault has three conceptual layers:

| Layer | What it is |
|---|---|
| **Execution Layer** | The `PomoVault.md` note — the single page the user opens to work |
| **Display Layer** | The NOW WORKING ON section — configurable via plugin settings |
| **Data Layer** | Any `.md` note in the vault — user points PomoVault at it |

On install: plugin creates `PomoVault.md`, opens it, prompts user to select or create a task source file. Done.

---

## 4. Functional Requirements

### 4.1 Must Have (MVP)

#### Installation & Setup
- [ ] Plugin creates `PomoVault.md` on first install containing a `pomoblock` code block
- [ ] Opens `PomoVault.md` automatically on first install
- [ ] Prompts user to select task source file on first run (any existing `.md` note)
- [ ] Zero required dependencies — no Dataview, no Tasks plugin, no other timer plugin

#### Execution Note (`pomoblock` renderer)
- [ ] Renders fully inside a markdown code block — works like any Obsidian note
- [ ] **Timer display** — large monospace countdown (default 25:00), turns red in final 60 seconds
- [ ] **Session indicator** — shows current mode (Work / Short Break / Long Break) and progress (e.g. Session 1/4)
- [ ] **NOW WORKING ON section** — updates instantly when ▶️ Start is clicked on a task
- [ ] **Task list** — reads from user-configured source file, renders with full interaction
- [ ] **Add Task button** — opens modal at bottom of task list

#### Task List
- [ ] Each task row displays: ▶️ Start · Priority badge · Task name · Recurring indicator (↺) · Due date · Start date · ✅ Done
- [ ] **▶️ Start** — starts timer + updates NOW WORKING ON with task name
- [ ] **✅ Done** — marks task complete in source file, removes from list immediately
- [ ] **Priority badges** — color-coded pills: URGENT (red) · HIGHEST (orange) · HIGH (yellow) · NORMAL/LOW/LOWEST (subtle outline)
- [ ] **Wikilinks** — `[[note name]]` in task text renders as clickable internal link
- [ ] **Recurring indicator** — ↺ shown for recurring tasks
- [ ] **Date display** — due date and start date shown per row; due date turns red if today or overdue
- [ ] **Start date filtering** — tasks with a future start date hidden until that date
- [ ] **Smart sort order:**
  1. Overdue / due today (sorted by priority within group)
  2. Future due date (sorted by soonest first)
  3. No due date (sorted by priority)

#### Timer Engine
- [ ] Self-contained — no external timer plugin required
- [ ] Work → Short Break → Work → Short Break → Work → Long Break cycle
- [ ] Fully automatic progression (configurable — can require manual start between sessions)
- [ ] Sound notification on session completion
- [ ] Timer state survives note re-renders (no resets when task list updates)
- [ ] Pause via right-click or keyboard command
- [ ] Reset available via keyboard command

#### Add Task Modal
- [ ] Opens from "+ Add Task" button
- [ ] Fields: Task name (text) · Priority (dropdown) · Due date (date picker) · Start date (date picker) · Recurring (toggle + interval input)
- [ ] Writes properly formatted markdown task to source file on save
- [ ] Power users can also type directly into source file using standard emoji syntax

#### Task Write Operations
- [ ] Mark complete: `- [ ]` → `- [x]` + appends `✅ YYYY-MM-DD`
- [ ] Recurring complete: marks done, appends next occurrence with updated dates
- [ ] Add task: appends new formatted task line to source file

#### Markdown Session Log
- [ ] Creates `PomoVault Log.md` by default
- [ ] Appends minimal work-session ledger entries in plain markdown
- [ ] Captures start time, end time, session type, duration, outcome, and active task text
- [ ] Logs work sessions by default; break logging is optional and off by default

#### Website
- [ ] Static React/Tailwind site built with Vite
- [ ] Deployed to GitHub Pages at `pomovault.com`
- [ ] Links to GitHub repo, install docs, task syntax, logging docs, and release notes
- [ ] Uses terse proof-of-work product voice aligned with ericgrill.com

---

### 4.2 Should Have (v1.1)

- [ ] **Keyboard shortcut** to open PomoVault.md from anywhere in vault
- [ ] **In-progress status** — `[/]` marker for tasks started but not finished
- [ ] **Task notes** — expand a task row to add/view inline notes
- [ ] **Mobile layout** — responsive adjustments for Obsidian mobile

---

### 4.3 Could Have (v2.0)

- [ ] **Multiple task source files** — pull tasks from several notes simultaneously
- [ ] **Statistics view** — streaks, daily pom count, tasks completed over time
- [ ] **Tag filtering** — show only tasks with a specific tag in execution view
- [ ] **Break suggestions** — show a random break activity during break timer
- [ ] **Ambient sounds** — background focus sounds during work session

---

### 4.4 Won't Have (explicitly out of scope)

- Cloud sync or cross-device session state
- AI task prioritization
- Team/shared vaults
- Integration with external task managers (Todoist, Things, etc.)
- Built-in calendar view

---

## 5. Plugin Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| Task source file | File picker | *(required)* | The `.md` note PomoVault reads tasks from |
| Work duration | Number | 25 min | Length of work session |
| Short break | Number | 5 min | Length of short break |
| Long break | Number | 15 min | Length of long break |
| Sessions before long break | Number | 4 | Work intervals before a long break triggers |
| Auto-advance | Toggle | ON | Automatically start next timer in cycle |
| Sound on completion | Toggle | ON | Play sound when session ends |
| Sound selection | Dropdown | chime | Built-in sounds or custom vault file |
| Volume | Slider | 70% | Sound volume |
| NOW WORKING ON: callout type | Dropdown | warning | warning / info / tip / danger / success |
| NOW WORKING ON: heading size | Dropdown | H2 | H1 / H2 / H3 |
| Show priority badges | Toggle | ON | Show colored priority pills on task rows |
| Show dates | Toggle | ON | Show due/start dates on task rows |
| Show recurring indicator | Toggle | ON | Show ↺ on recurring tasks |

---

## 6. Architecture

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

### Internal Modules

| Module | File | Responsibility |
|---|---|---|
| **Main** | `main.ts` | Plugin lifecycle, registers pomoblock processor, creates PomoVault.md on install |
| **Renderer** | `renderer.ts` | Draws timer, NOW WORKING ON, task list — the full pomoblock UI |
| **Task Parser** | `task-parser.ts` | Reads/writes markdown tasks + emoji metadata from source file |
| **Timer Engine** | `timer.ts` | Work/break cycle, countdown, sound, state persistence |
| **Task Modal** | `task-modal.ts` | Add task form — fields write formatted markdown to source file |
| **Settings** | `settings.ts` | Settings tab + data.json persistence |

---

## 7. Task Format Specification

PomoVault reads and writes standard markdown task syntax, compatible with (but not requiring) the Obsidian Tasks plugin:

```markdown
- [ ] Task name 📅 2026-05-04 🛫 2026-05-03 ⏫
- [ ] Recurring task 🔁 every week 🔼
- [x] Completed task ✅ 2026-05-02
- [/] In-progress task
- [ ] Task with link [[Project Note]] 🔺
```

### Emoji Key

| Emoji | Meaning |
|---|---|
| 📅 | Due date |
| 🛫 | Start date (hidden until this date) |
| ⏫ | Highest priority |
| 🔺 | Urgent priority |
| 🔼 | High priority |
| 🔽 | Low priority |
| ⏬ | Lowest priority |
| 🔁 | Recurring |
| ➕ | Created date |
| ✅ | Completion date |

---

## 8. Non-Functional Requirements

- **Zero dependencies** — no other community plugins required
- **Performance** — task list renders in <100ms for up to 500 tasks
- **Compatibility** — works alongside Tasks plugin if installed; does not conflict
- **State safety** — timer never resets due to Obsidian re-rendering the note
- **Mobile** — renders and functions on Obsidian mobile (iOS/Android)
- **Theme compatibility** — uses Obsidian CSS variables; works with all community themes
- **File safety** — never overwrites user data; only modifies the lines it needs to

---

## 9. Out of Scope

| Feature | Rationale |
|---|---|
| Cloud sync | Out of Obsidian's model; adds infra complexity |
| Multi-vault | Adds complexity with minimal gain for v1 |
| AI prioritization | Distracts from core value; can be v3 |
| External task manager integrations | PomoVault is vault-native by design |
| Built-in calendar | Separate concern; other plugins do this better |

---

## 10. Open Questions

1. **Distribution** — Free, freemium, or paid on Obsidian community plugin store?
2. **Plugin ID** — `pomovault` or `pomo-vault`?
3. **PomoVault.md location** — vault root or user-configurable folder?
4. **Tasks plugin migration** — should PomoVault offer a one-click import for users already using Tasks plugin?
5. **Obsidian mobile** — are there API restrictions on mobile that affect the timer or file writes?
6. **Sound files** — bundle sounds in plugin or load from CDN (affects plugin size)?

---

## 11. Success Metrics

- **Adoption:** 1,000 installs within 90 days of publishing to community store
- **Retention:** Users open PomoVault.md at least 3x per week
- **Setup time:** New user completes setup and starts first Pomodoro in under 2 minutes
- **Zero-dependency install:** No support tickets about missing plugin dependencies

---

*Built on the Pomodoro Technique® by Francesco Cirillo.*
