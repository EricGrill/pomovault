# PomoVault Product Design

Date: 2026-05-02
Status: Approved design draft
Source PRD: `PomoVault PRD.md`
Domain: `pomovault.com`

## Product Direction

PomoVault is a vault-native productivity system for Obsidian: Pomodoro timer, integrated task management, and markdown session logging in one focused workflow.

The v1 promise is:

> Open one note, pick the right task, run the timer, and leave behind a clean record in your vault.

The product should feel polished and complete, but it should not become a broad productivity suite in v1. The center of gravity is execution: the user sits down, sees what matters, starts a Pomodoro, completes or resets the session, and gets a minimal markdown ledger entry as proof of work.

## Target Users

Primary user: an ADHD or focus-friction-prone knowledge worker who needs the system to reduce initiation overhead. They need one obvious place to work and one obvious next action.

Secondary user: an Obsidian power user who already uses markdown tasks and wants a focused execution layer without Dataview, Tasks, or another timer plugin as required dependencies.

## V1 Scope

V1 should ship:

- First-run creation/opening of `PomoVault.md`.
- A single configured task source `.md` file.
- A `pomoblock` execution UI rendered inside Obsidian markdown.
- Work, short break, and long break timer cycle.
- Start, pause, reset, and complete-task interactions.
- Task parsing for checkbox state, priority, due date, start date, recurring marker, and wikilinks.
- Smart task sorting: overdue/today first, then future due dates, then no due date.
- Future start-date filtering.
- Add Task modal.
- Safe markdown write-back for completed tasks and added tasks.
- Minimal markdown session ledger in `PomoVault Log.md`.
- Settings tab for source paths, durations, auto-advance, sound, and display options.
- Static product/docs website at `pomovault.com`.

Deferred from v1:

- Work journal/reflections.
- Stats and streak charts.
- Multiple task source files.
- Tag filtering.
- Ambient sounds.
- AI prioritization.
- Calendar integration.
- External task manager integrations.

Recurring tasks should display in v1. Regenerating recurring tasks on completion should ship only if the parser and writer tests prove it is safe; otherwise advanced recurrence generation moves to v1.1.

## Plugin Experience

`PomoVault.md` is the command center. On first run, the plugin creates or opens the note, prompts for a task source note, and renders the `pomoblock`.

The `pomoblock` should include:

- Active timer display.
- Current mode: Work, Short Break, or Long Break.
- Session progress, such as `Session 1/4`.
- NOW WORKING ON section.
- Sorted interactive task list.
- Add Task control.

Starting a task binds it to the timer and updates NOW WORKING ON. Completing a task updates the source markdown line, removes the task from the active list, and records the session in the log when appropriate.

The plugin must remain vault-native and offline-capable. The website is informational only and is not a dependency.

## Markdown Logging

Markdown logging is part of v1, not v1.1.

Default file: `PomoVault Log.md`

The log should be a minimal ledger, not a journal. It should capture enough to show what happened without asking the user to write reflections.

Default format:

```markdown
## 2026-05-02

- 09:00-09:25 | Work | 25m | Completed | [[Project Note]] Draft proposal
- 10:00-10:12 | Work | 12m | Reset | Inbox triage
```

V1 log fields:

- Start and end time.
- Session type, which is `Work` by default in the v1 ledger.
- Duration.
- Outcome: `Completed`, `Reset`, or `Skipped`.
- Linked task text for work sessions when a task is active.

The writer should append under the relevant date heading. It should not rewrite historical entries except to insert the date heading or append a new line in the correct section.

V1 logs work sessions by default. Break logging should be a setting, off by default, because the ledger's main job is to record completed focus work.

## Architecture

The repository should contain two deliverables: the Obsidian plugin and the static website.

```text
pomovault/
  PomoVault PRD.md
  docs/
    superpowers/specs/
      2026-05-02-pomovault-product-design.md
  plugin/
    manifest.json
    main.ts
    renderer.ts
    task-parser.ts
    timer.ts
    log-writer.ts
    task-modal.ts
    settings.ts
  site/
    index.html
    src/
    public/
    package.json
  .github/
    workflows/
      pages.yml
  CNAME
```

Plugin module responsibilities:

| Module | Responsibility |
| --- | --- |
| `main.ts` | Plugin lifecycle, commands, first-run setup, markdown code block processor |
| `settings.ts` | Settings schema, defaults, settings tab, data persistence |
| `renderer.ts` | Timer UI, task list UI, NOW WORKING ON, controls |
| `task-parser.ts` | Markdown task parsing, metadata extraction, safe line writes |
| `timer.ts` | Timer state, session cycle, pause/resume/reset, completion events |
| `log-writer.ts` | Append-only markdown ledger writes |
| `task-modal.ts` | Add Task modal and task-line formatting |

Key boundary: timer state must live outside renderer lifecycle so Obsidian re-renders do not reset active sessions.

## Website

The website should be a static React site built with Vite and Tailwind, deployed to GitHub Pages.

Stack:

- Vite
- React
- Tailwind
- GitHub Actions
- GitHub Pages
- Custom domain: `pomovault.com`

GitHub Pages is sufficient because the site needs static product copy, docs, screenshots, install instructions, and GitHub links. It does not need server-side rendering, API routes, auth, a database, or runtime Node.js functions.

The voice should feel like ericgrill.com wrote it: command-line labels, proof-of-work language, terse field-note copy, and dark terminal energy. It should not feel like generic SaaS marketing.

Working homepage line:

> Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.

Core website sections:

- Hero with product name and literal offer.
- Workflow: choose task, start timer, log proof of work.
- Product proof: screenshots or GIFs of `PomoVault.md`, task source markdown, and `PomoVault Log.md`.
- Feature sections: timer, task management, markdown logs, no required dependencies.
- Docs: setup, task syntax, logging, keyboard commands, settings.
- Links: GitHub repo, install guide, releases/changelog, contributing.

DNS/deployment requirements:

- Add `pomovault.com` as the GitHub Pages custom domain.
- Add `CNAME` with `pomovault.com` if using branch publishing, or configure through Pages settings for Actions publishing.
- Point apex domain DNS to GitHub Pages records.
- Configure `www` as a CNAME to the GitHub Pages default domain if desired.
- Enforce HTTPS after certificate provisioning succeeds.

## Testing Strategy

The highest-risk behavior is writing to user markdown files safely. Parser and writer tests come before UI polish.

Required test coverage:

- Task parsing: priorities, due dates, start dates, wikilinks, recurrence markers, completed tasks.
- Sorting/filtering: overdue, due today, future due, no due, hidden future start dates.
- Write operations: complete task, append completion date, add task, append log entry under date heading.
- Timer behavior with fake time: work/break progression, pause/resume, reset, auto-advance on/off.
- Renderer smoke cases: empty source file, missing source file, invalid settings, large task source.

Manual QA:

- Fresh install and first-run setup.
- Selecting an existing task source note.
- Starting, pausing, resetting, and completing a task.
- Log entry creation.
- Sound behavior.
- Narrow/mobile-like layout.
- Theme compatibility using Obsidian CSS variables.

## Risks And Decisions

- File writes must be line-targeted and conservative.
- Logs should append rather than rewrite.
- Timer state must survive markdown re-renders.
- Mobile and audio behavior should be verified before being promised heavily.
- Recurrence generation should be deferred unless the safe writer implementation is well tested.
- The website can use styled mockups initially, but launch-quality proof needs real plugin screenshots or GIFs.

## Open Follow-Ups

- Confirm plugin ID: `pomovault` is the likely default.
- Confirm distribution model: free is simplest for Obsidian community plugin adoption.
- Decide whether to expose the break-logging setting in v1 settings or keep it internal until v1.1.
- Decide whether users can change the default log path during first-run setup, while keeping `PomoVault Log.md` as the default.
- Update the original PRD so logging is moved from v1.1 to v1.
