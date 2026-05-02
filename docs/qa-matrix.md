# Manual QA matrix (pre–public launch)

Use this document as a **template**: check boxes only after you have personally verified the behavior in that environment. Do not pre-check rows you have not run.

**Tester:** _______________ **Date:** _______________ **Version / commit:** _______________

---

## Fresh vault install

- [ ] New or empty vault; plugin files (`main.js`, `manifest.json`, `styles.css`) copied to `.obsidian/plugins/pomovault/`.
- [ ] Plugin enables without console errors.
- [ ] No stale settings from a prior vault (or document if testing with migrated settings).

## First run / `PomoVault.md`

- [ ] On first run, `PomoVault.md` is created (or updated) as expected.
- [ ] First-run note opens or is reachable from the UI without broken links.
- [ ] Default or onboarding content matches current product copy.

## Task source config

- [ ] Task source path or note can be set and saved.
- [ ] Tasks from the configured source appear in the plugin UI.
- [ ] Invalid or missing source surfaces a clear error or empty state (note behavior).

## Timer: start, pause, reset

- [ ] Start begins timing and UI reflects running state.
- [ ] Pause holds elapsed time; resume continues correctly.
- [ ] Reset returns timer to the expected initial state without corrupting task selection.

## Complete task, add task

- [ ] Completing a task updates the task source (or log) as designed.
- [ ] Adding a task (if supported in UI) creates or appends correctly in the task source.
- [ ] Edge case: complete with no task selected (confirm behavior).

## Log file writes

- [ ] `PomoVault Log.md` (or configured log path) is created when needed.
- [ ] Work-session or ledger lines append with expected format and timestamps.
- [ ] No duplicate or truncated writes under normal use.

## Light theme / dark theme

- [ ] **Light:** layout readable; controls and timer visible; no illegible contrast.
- [ ] **Dark:** same checks as light.
- [ ] Theme switch while plugin is open does not leave broken styles (resize / reopen if applicable).

## Mobile / touch

> **Scope:** Mark each line only after verification on a real device or Obsidian mobile build. If mobile is out of scope for this release, leave all boxes unchecked and note that in **Release notes**.

- [ ] **Mobile / touch — not verified for this release** (check this row if you are explicitly deferring mobile QA; leave timer/task rows unchecked).
- [ ] Install or sideload on mobile (if applicable); plugin loads.
- [ ] Timer start / pause / reset usable with touch targets.
- [ ] Task list scroll and complete / add flows usable on a small screen.

---

## Sign-off

- [ ] All in-scope rows above are checked, or exceptions are listed in release notes.
- [ ] `npm run verify` and release checklist items completed for this build.
