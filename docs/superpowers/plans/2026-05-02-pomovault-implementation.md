# PomoVault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build PomoVault v1 as an Obsidian plugin with integrated Pomodoro task execution, safe markdown task writes, minimal markdown session logging, and a static React/Tailwind website deployed through GitHub Pages.

**Architecture:** The Obsidian plugin is the primary product and lives at the repository root for release compatibility, with focused TypeScript modules under `src/`. The website is a separate static Vite app under `site/` and has no runtime dependency on the plugin. Tests protect parser, writer, timer, and ledger behavior before UI polish.

**Tech Stack:** TypeScript, Obsidian API, esbuild, Vitest, jsdom, Vite, React, Tailwind, GitHub Actions, GitHub Pages.

---

## Autonomous Execution Contract

The user requested one-shot execution with no midstream interruptions. Execute this plan from start to finish without asking for approval during local implementation.

Use this loop after every task:

1. Run the task's verification command.
2. If it fails, read the failing output and identify the smallest fix.
3. Patch the relevant files.
4. Rerun the exact failing command.
5. Continue until the command passes.
6. Commit with the Lore commit protocol.
7. Move to the next task.

Do not stop for:

- Type errors.
- Test failures.
- Styling regressions.
- Missing local folders.
- Build configuration mistakes.
- Needed refactors inside the approved v1 scope.

Only avoid doing irreversible or credential-gated external actions:

- Do not publish a GitHub release without repository credentials and explicit release authority.
- Do not edit DNS records for `pomovault.com`.
- Do not submit to the Obsidian community plugin registry.

For those external actions, create or update `docs/release-checklist.md` and continue.

Use native subagents for disjoint local lanes when it improves throughput:

- Parser/writer/timer tests and implementation.
- Obsidian integration and renderer.
- Static website and GitHub Pages.
- Final verification and review.

Keep write scopes disjoint if subagents are used. Integrate and run the full verification suite before final reporting.

## Sources Checked

- Obsidian build guidance: `https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin`
- Obsidian manifest schema: `https://docs.obsidian.md/Reference/Manifest`
- Obsidian markdown code block processor API: `https://obsidian-developer-docs.pages.dev/Reference/TypeScript-API/Plugin/registerMarkdownCodeBlockProcessor`
- Obsidian release/submission requirements: `https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin`
- Vite GitHub Pages deployment: `https://vite.dev/guide/static-deploy`
- GitHub Pages custom domain/HTTPS docs already referenced in the product design.

Implementation adjustment from the design spec: keep `manifest.json` at repo root because Obsidian submission docs expect a root manifest and release assets. Keep plugin source under `src/`; keep website under `site/`.

## File Structure

Create or modify these files:

```text
pomovault/
  package.json
  package-lock.json
  tsconfig.json
  esbuild.config.mjs
  manifest.json
  versions.json
  styles.css
  README.md
  LICENSE
  CNAME
  src/
    main.ts
    constants.ts
    types.ts
    settings.ts
    task-parser.ts
    task-sorter.ts
    task-writer.ts
    timer.ts
    log-writer.ts
    renderer.ts
    task-modal.ts
    obsidian-services.ts
  tests/
    settings.test.ts
    task-parser.test.ts
    task-sorter.test.ts
    task-writer.test.ts
    log-writer.test.ts
    timer.test.ts
    renderer.test.ts
    obsidian-services.test.ts
  site/
    package.json
    package-lock.json
    index.html
    vite.config.ts
    tailwind.config.ts
    postcss.config.js
    src/
      main.tsx
      App.tsx
      styles.css
      content.ts
  .github/
    workflows/
      pages.yml
      plugin-release.yml
  docs/
    release-checklist.md
    development.md
```

Boundary rules:

- `src/task-parser.ts` parses text into data and does not write.
- `src/task-writer.ts` transforms markdown source strings and does not call Obsidian APIs.
- `src/log-writer.ts` transforms ledger markdown source strings and formats entries.
- `src/timer.ts` owns timer state and has no DOM dependency.
- `src/renderer.ts` owns DOM rendering and delegates all file writes through callbacks.
- `src/obsidian-services.ts` is the only module that directly reads/writes vault files.
- `src/main.ts` wires Obsidian lifecycle, services, renderer, commands, and settings.

## Task 1: Repository Tooling And Release Baseline

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `esbuild.config.mjs`
- Create: `manifest.json`
- Create: `versions.json`
- Create: `styles.css`
- Create: `README.md`
- Create: `LICENSE`
- Modify: `.gitignore`

- [ ] **Step 1: Install root dev dependencies**

Run:

```bash
npm install --save-dev @types/node builtin-modules esbuild jsdom obsidian tslib typescript vitest
```

Expected: `package.json` and `package-lock.json` are created or updated, and npm exits successfully.

- [ ] **Step 2: Replace root `package.json` metadata and scripts**

Keep the npm-written `devDependencies` block exactly as npm created it. Replace the metadata, keywords, license, and scripts with this shape:

```json
{
  "name": "pomovault",
  "version": "0.1.0",
  "description": "Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc --noEmit && node esbuild.config.mjs production",
    "test": "vitest run",
    "test:watch": "vitest",
    "verify": "npm test && npm run build && npm --prefix site run build",
    "site:dev": "npm --prefix site run dev",
    "site:build": "npm --prefix site run build",
    "site:preview": "npm --prefix site run preview",
    "package-plugin": "npm run build && mkdir -p dist/plugin && cp main.js manifest.json styles.css dist/plugin/"
  },
  "keywords": [
    "obsidian",
    "obsidian-plugin",
    "pomodoro",
    "tasks",
    "markdown"
  ],
  "author": "Eric Grill",
  "license": "MIT"
}
```

After editing, run:

```bash
npm install
```

Expected: npm updates the lockfile without removing the dev dependencies.

- [ ] **Step 3: Create TypeScript and esbuild config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2022",
    "allowJs": false,
    "noImplicitAny": true,
    "moduleResolution": "Bundler",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "lib": ["DOM", "ES2022"],
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts", "esbuild.config.mjs"]
}
```

Create `esbuild.config.mjs`:

```js
import esbuild from "esbuild";
import process from "node:process";
import builtins from "builtin-modules";

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  banner: {
    js: "/* PomoVault - Pomodoro execution for Obsidian */",
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", "@codemirror/autocomplete", "@codemirror/collab", "@codemirror/commands", "@codemirror/language", "@codemirror/lint", "@codemirror/search", "@codemirror/state", "@codemirror/view", "@lezer/common", "@lezer/highlight", "@lezer/lr", ...builtins],
  format: "cjs",
  target: "es2022",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (prod) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
  console.log("Watching PomoVault plugin sources...");
}
```

- [ ] **Step 4: Create manifest and versions**

Create `manifest.json`:

```json
{
  "id": "pomovault",
  "name": "PomoVault",
  "version": "0.1.0",
  "minAppVersion": "1.5.0",
  "description": "Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.",
  "author": "Eric Grill",
  "authorUrl": "https://www.ericgrill.com",
  "isDesktopOnly": false
}
```

Create `versions.json`:

```json
{
  "0.1.0": "1.5.0"
}
```

- [ ] **Step 5: Create initial `styles.css`, `README.md`, and `LICENSE`**

Create `styles.css` with a minimal namespace:

```css
.pomovault {
  --pv-accent: var(--interactive-accent);
  --pv-danger: var(--text-error);
  --pv-muted: var(--text-muted);
  --pv-border: var(--background-modifier-border);
  --pv-surface: var(--background-secondary);
}
```

Create `README.md`:

```markdown
# PomoVault

Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.

PomoVault is an Obsidian plugin that creates a focused execution note, reads tasks from a configured markdown source, runs Pomodoro sessions, and writes a minimal session ledger back into the vault.

## Development

```bash
npm install
npm test
npm run build
```

The website lives in `site/` and deploys as a static GitHub Pages site for `pomovault.com`.
```

Create `LICENSE` with the MIT license and copyright holder:

```text
MIT License

Copyright (c) 2026 Eric Grill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 6: Update `.gitignore` for local test vaults and build output**

Ensure `.gitignore` includes:

```gitignore
.DS_Store
.omx/
.superpowers/
.test-vault/
node_modules/
dist/
build/
coverage/
main.js
/plugin/*.js
/plugin/*.map
/plugin/styles.css
.env
.env.*
!.env.example
```

- [ ] **Step 7: Verify and commit**

Run:

```bash
git diff --check
```

Expected: whitespace check passes. Build verification starts in Task 2 after `src/main.ts` exists.

Commit:

```bash
git add package.json package-lock.json tsconfig.json esbuild.config.mjs manifest.json versions.json styles.css README.md LICENSE .gitignore
git commit -m "Prepare PomoVault for Obsidian plugin development" \
  -m "The project needs the standard Obsidian plugin release assets at the repository root while keeping source modules focused under src/." \
  -m "Constraint: Obsidian release review expects manifest metadata and release assets to be easy to locate" \
  -m "Rejected: Keep manifest only under plugin/ | root manifest better matches Obsidian release and sample-plugin conventions" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm install; git diff --check" \
  -m "Not-tested: Obsidian runtime loading"
```

## Task 2: Settings, Constants, And Minimal Plugin Entry

**Files:**
- Create: `src/constants.ts`
- Create: `src/types.ts`
- Create: `src/settings.ts`
- Create: `src/main.ts`
- Create: `tests/settings.test.ts`

- [ ] **Step 1: Write settings tests**

Create `tests/settings.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/settings";

describe("settings", () => {
  it("uses vault-native defaults", () => {
    expect(DEFAULT_SETTINGS.executionNotePath).toBe("PomoVault.md");
    expect(DEFAULT_SETTINGS.logPath).toBe("PomoVault Log.md");
    expect(DEFAULT_SETTINGS.workMinutes).toBe(25);
    expect(DEFAULT_SETTINGS.shortBreakMinutes).toBe(5);
    expect(DEFAULT_SETTINGS.longBreakMinutes).toBe(15);
    expect(DEFAULT_SETTINGS.sessionsBeforeLongBreak).toBe(4);
    expect(DEFAULT_SETTINGS.logBreaks).toBe(false);
  });

  it("normalizes invalid timer settings to safe defaults", () => {
    const normalized = normalizeSettings({
      workMinutes: 0,
      shortBreakMinutes: -3,
      longBreakMinutes: 0,
      sessionsBeforeLongBreak: 0,
      taskSourcePath: "",
    });

    expect(normalized.workMinutes).toBe(25);
    expect(normalized.shortBreakMinutes).toBe(5);
    expect(normalized.longBreakMinutes).toBe(15);
    expect(normalized.sessionsBeforeLongBreak).toBe(4);
    expect(normalized.taskSourcePath).toBe("");
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm test -- tests/settings.test.ts
```

Expected: FAIL because `src/settings.ts` does not exist.

- [ ] **Step 3: Implement constants, types, settings, and minimal main**

Create `src/constants.ts`:

```ts
export const PLUGIN_ID = "pomovault";
export const EXECUTION_NOTE = "PomoVault.md";
export const LOG_NOTE = "PomoVault Log.md";
export const TASK_BLOCK_LANGUAGE = "pomoblock";
```

Create `src/types.ts`:

```ts
export type Priority = "urgent" | "highest" | "high" | "normal" | "low" | "lowest";
export type TaskStatus = "todo" | "done" | "in-progress";
export type SessionMode = "work" | "short-break" | "long-break";
export type SessionOutcome = "Completed" | "Reset" | "Skipped";

export interface PomoVaultSettings {
  executionNotePath: string;
  taskSourcePath: string;
  logPath: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoAdvance: boolean;
  soundOnCompletion: boolean;
  soundName: "chime";
  volume: number;
  nowWorkingCallout: "warning" | "info" | "tip" | "danger" | "success";
  nowWorkingHeading: "H1" | "H2" | "H3";
  showPriorityBadges: boolean;
  showDates: boolean;
  showRecurringIndicator: boolean;
  logBreaks: boolean;
}

export interface ParsedTask {
  id: string;
  filePath: string;
  lineNumber: number;
  originalLine: string;
  indentation: string;
  status: TaskStatus;
  text: string;
  displayText: string;
  priority: Priority;
  dueDate: string | null;
  startDate: string | null;
  recurring: string | null;
  completedDate: string | null;
}

export interface AddTaskInput {
  text: string;
  priority: Priority;
  dueDate: string | null;
  startDate: string | null;
  recurring: string | null;
}

export interface TimerDurations {
  workSeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  sessionsBeforeLongBreak: number;
}

export interface TimerState {
  mode: SessionMode;
  running: boolean;
  remainingSeconds: number;
  completedWorkSessions: number;
  activeTaskId: string | null;
  activeTaskText: string | null;
  sessionStartedAt: number | null;
  lastTickAt: number | null;
}

export interface LedgerEntry {
  date: string;
  startTime: string;
  endTime: string;
  mode: SessionMode;
  durationMinutes: number;
  outcome: SessionOutcome;
  taskText: string | null;
}
```

Create `src/settings.ts`:

```ts
import { EXECUTION_NOTE, LOG_NOTE } from "./constants";
import type { PomoVaultSettings } from "./types";

export const DEFAULT_SETTINGS: PomoVaultSettings = {
  executionNotePath: EXECUTION_NOTE,
  taskSourcePath: "",
  logPath: LOG_NOTE,
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoAdvance: true,
  soundOnCompletion: true,
  soundName: "chime",
  volume: 70,
  nowWorkingCallout: "warning",
  nowWorkingHeading: "H2",
  showPriorityBadges: true,
  showDates: true,
  showRecurringIndicator: true,
  logBreaks: false,
};

export function normalizeSettings(input: Partial<PomoVaultSettings> | null | undefined): PomoVaultSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(input ?? {}) };

  return {
    ...merged,
    executionNotePath: merged.executionNotePath.trim() || DEFAULT_SETTINGS.executionNotePath,
    taskSourcePath: merged.taskSourcePath.trim(),
    logPath: merged.logPath.trim() || DEFAULT_SETTINGS.logPath,
    workMinutes: positiveInteger(merged.workMinutes, DEFAULT_SETTINGS.workMinutes),
    shortBreakMinutes: positiveInteger(merged.shortBreakMinutes, DEFAULT_SETTINGS.shortBreakMinutes),
    longBreakMinutes: positiveInteger(merged.longBreakMinutes, DEFAULT_SETTINGS.longBreakMinutes),
    sessionsBeforeLongBreak: positiveInteger(merged.sessionsBeforeLongBreak, DEFAULT_SETTINGS.sessionsBeforeLongBreak),
    volume: clamp(merged.volume, 0, 100),
  };
}

function positiveInteger(value: number, fallback: number): number {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.volume;
  return Math.min(max, Math.max(min, Math.round(value)));
}
```

Create `src/main.ts` as a buildable plugin shell:

```ts
import { Plugin } from "obsidian";
import { TASK_BLOCK_LANGUAGE } from "./constants";
import { DEFAULT_SETTINGS, normalizeSettings } from "./settings";
import type { PomoVaultSettings } from "./types";

export default class PomoVaultPlugin extends Plugin {
  settings: PomoVaultSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());

    this.registerMarkdownCodeBlockProcessor(TASK_BLOCK_LANGUAGE, (_source, el) => {
      el.empty();
      el.createDiv({ cls: "pomovault", text: "PomoVault is loading." });
    });
  }

  async onunload(): Promise<void> {
    await this.saveData(this.settings);
  }
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/settings.test.ts
npm run build
```

Expected: PASS and build creates `main.js`.

Commit:

```bash
git add src/constants.ts src/types.ts src/settings.ts src/main.ts tests/settings.test.ts package.json package-lock.json tsconfig.json esbuild.config.mjs manifest.json versions.json styles.css README.md LICENSE .gitignore
git commit -m "Create the PomoVault plugin baseline" \
  -m "A buildable Obsidian plugin shell locks the settings schema and root manifest before domain logic is added." \
  -m "Constraint: Timer and renderer work depends on stable settings defaults" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm test -- tests/settings.test.ts; npm run build" \
  -m "Not-tested: Obsidian runtime loading"
```

## Task 3: Task Parser

**Files:**
- Create: `src/task-parser.ts`
- Create: `tests/task-parser.test.ts`
- Modify: `src/types.ts` if parser types need narrowing

- [ ] **Step 1: Write parser tests**

Create `tests/task-parser.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatTaskLine, parseTasks } from "../src/task-parser";

describe("parseTasks", () => {
  it("parses Tasks-style metadata and wikilinks", () => {
    const source = [
      "- [ ] Draft [[Project Note]] proposal 📅 2026-05-04 🛫 2026-05-03 ⏫ 🔁 every week",
      "- [x] Completed item ✅ 2026-05-02",
      "  - [/] Started task 🔼",
    ].join("\n");

    const tasks = parseTasks(source, "Tasks.md");

    expect(tasks).toHaveLength(3);
    expect(tasks[0]).toMatchObject({
      filePath: "Tasks.md",
      lineNumber: 0,
      status: "todo",
      text: "Draft [[Project Note]] proposal",
      displayText: "Draft [[Project Note]] proposal",
      priority: "highest",
      dueDate: "2026-05-04",
      startDate: "2026-05-03",
      recurring: "every week",
    });
    expect(tasks[1]).toMatchObject({
      status: "done",
      completedDate: "2026-05-02",
      priority: "normal",
    });
    expect(tasks[2]).toMatchObject({
      indentation: "  ",
      status: "in-progress",
      priority: "high",
    });
  });

  it("ignores non-task lines and preserves stable ids", () => {
    const source = "# Heading\n\n- [ ] One\nPlain text\n- [ ] Two 🔺";
    const tasks = parseTasks(source, "Inbox.md");

    expect(tasks.map((task) => task.id)).toEqual(["Inbox.md:2", "Inbox.md:4"]);
    expect(tasks.map((task) => task.priority)).toEqual(["normal", "urgent"]);
  });
});

describe("formatTaskLine", () => {
  it("formats an added task with metadata in a Tasks-compatible order", () => {
    expect(formatTaskLine({
      text: "Ship PomoVault [[Launch]]",
      priority: "urgent",
      dueDate: "2026-05-04",
      startDate: "2026-05-03",
      recurring: "every week",
    })).toBe("- [ ] Ship PomoVault [[Launch]] 📅 2026-05-04 🛫 2026-05-03 🔁 every week 🔺");
  });
});
```

- [ ] **Step 2: Run failing parser tests**

Run:

```bash
npm test -- tests/task-parser.test.ts
```

Expected: FAIL because `src/task-parser.ts` does not exist.

- [ ] **Step 3: Implement parser**

Create `src/task-parser.ts` with these exports:

```ts
import type { AddTaskInput, ParsedTask, Priority, TaskStatus } from "./types";

const TASK_RE = /^(\s*)- \[([ x/])\]\s+(.+)$/;
const DATE_RE = /(?:^|\s)📅\s*(\d{4}-\d{2}-\d{2})/u;
const START_RE = /(?:^|\s)🛫\s*(\d{4}-\d{2}-\d{2})/u;
const DONE_RE = /(?:^|\s)✅\s*(\d{4}-\d{2}-\d{2})/u;
const RECUR_RE = /(?:^|\s)🔁\s*([^📅🛫✅⏫🔺🔼🔽⏬]+)/u;

const PRIORITY_BY_EMOJI: Array<[string, Priority]> = [
  ["🔺", "urgent"],
  ["⏫", "highest"],
  ["🔼", "high"],
  ["🔽", "low"],
  ["⏬", "lowest"],
];

const EMOJI_BY_PRIORITY: Record<Priority, string> = {
  urgent: "🔺",
  highest: "⏫",
  high: "🔼",
  normal: "",
  low: "🔽",
  lowest: "⏬",
};

export function parseTasks(source: string, filePath: string): ParsedTask[] {
  return source.split(/\r?\n/).flatMap((line, lineNumber) => {
    const match = TASK_RE.exec(line);
    if (!match) return [];

    const [, indentation, marker, body] = match;
    const text = stripMetadata(body).trim();

    return [{
      id: `${filePath}:${lineNumber}`,
      filePath,
      lineNumber,
      originalLine: line,
      indentation,
      status: parseStatus(marker),
      text,
      displayText: text,
      priority: parsePriority(body),
      dueDate: matchDate(DATE_RE, body),
      startDate: matchDate(START_RE, body),
      recurring: matchRecurring(body),
      completedDate: matchDate(DONE_RE, body),
    }];
  });
}

export function formatTaskLine(input: AddTaskInput): string {
  const parts = [`- [ ] ${input.text.trim()}`];
  if (input.dueDate) parts.push(`📅 ${input.dueDate}`);
  if (input.startDate) parts.push(`🛫 ${input.startDate}`);
  if (input.recurring) parts.push(`🔁 ${input.recurring.trim()}`);
  const priorityEmoji = EMOJI_BY_PRIORITY[input.priority];
  if (priorityEmoji) parts.push(priorityEmoji);
  return parts.join(" ");
}

export function stripMetadata(body: string): string {
  return body
    .replace(DATE_RE, "")
    .replace(START_RE, "")
    .replace(DONE_RE, "")
    .replace(RECUR_RE, "")
    .replace(/[⏫🔺🔼🔽⏬]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseStatus(marker: string): TaskStatus {
  if (marker === "x") return "done";
  if (marker === "/") return "in-progress";
  return "todo";
}

function parsePriority(body: string): Priority {
  return PRIORITY_BY_EMOJI.find(([emoji]) => body.includes(emoji))?.[1] ?? "normal";
}

function matchDate(regex: RegExp, body: string): string | null {
  return regex.exec(body)?.[1] ?? null;
}

function matchRecurring(body: string): string | null {
  return RECUR_RE.exec(body)?.[1].trim() ?? null;
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/task-parser.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/task-parser.ts src/types.ts tests/task-parser.test.ts
git commit -m "Parse vault tasks without external plugin dependencies" \
  -m "The parser understands plain markdown tasks plus Tasks-style emoji metadata while keeping parsing separate from vault writes." \
  -m "Constraint: PomoVault must work without Dataview or Tasks installed" \
  -m "Rejected: Depend on the Tasks plugin parser | zero required dependencies is core to v1" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm test -- tests/task-parser.test.ts; npm run build" \
  -m "Not-tested: Exotic recurrence grammar beyond preserving the recurrence phrase"
```

## Task 4: Task Sorting And Filtering

**Files:**
- Create: `src/task-sorter.ts`
- Create: `tests/task-sorter.test.ts`

- [ ] **Step 1: Write sorter tests**

Create `tests/task-sorter.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { ParsedTask } from "../src/types";
import { getVisibleSortedTasks } from "../src/task-sorter";

function task(overrides: Partial<ParsedTask>): ParsedTask {
  return {
    id: "Tasks.md:1",
    filePath: "Tasks.md",
    lineNumber: 1,
    originalLine: "- [ ] Task",
    indentation: "",
    status: "todo",
    text: "Task",
    displayText: "Task",
    priority: "normal",
    dueDate: null,
    startDate: null,
    recurring: null,
    completedDate: null,
    ...overrides,
  };
}

describe("getVisibleSortedTasks", () => {
  it("hides completed tasks and future start dates", () => {
    const result = getVisibleSortedTasks([
      task({ id: "done", status: "done" }),
      task({ id: "future", startDate: "2026-05-03" }),
      task({ id: "visible", startDate: "2026-05-02" }),
    ], "2026-05-02");

    expect(result.map((item) => item.id)).toEqual(["visible"]);
  });

  it("sorts due today and overdue before future dates and no due dates", () => {
    const result = getVisibleSortedTasks([
      task({ id: "none", dueDate: null, priority: "urgent" }),
      task({ id: "future", dueDate: "2026-05-05", priority: "normal" }),
      task({ id: "today-low", dueDate: "2026-05-02", priority: "low" }),
      task({ id: "overdue-high", dueDate: "2026-05-01", priority: "high" }),
      task({ id: "today-urgent", dueDate: "2026-05-02", priority: "urgent" }),
    ], "2026-05-02");

    expect(result.map((item) => item.id)).toEqual([
      "today-urgent",
      "overdue-high",
      "today-low",
      "future",
      "none",
    ]);
  });
});
```

- [ ] **Step 2: Run failing sorter tests**

Run:

```bash
npm test -- tests/task-sorter.test.ts
```

Expected: FAIL because `src/task-sorter.ts` does not exist.

- [ ] **Step 3: Implement sorter**

Create `src/task-sorter.ts`:

```ts
import type { ParsedTask, Priority } from "./types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 0,
  highest: 1,
  high: 2,
  normal: 3,
  low: 4,
  lowest: 5,
};

export function getVisibleSortedTasks(tasks: ParsedTask[], today: string): ParsedTask[] {
  return tasks
    .filter((task) => task.status !== "done")
    .filter((task) => !task.startDate || task.startDate <= today)
    .sort((a, b) => {
      const groupDiff = dueGroup(a, today) - dueGroup(b, today);
      if (groupDiff !== 0) return groupDiff;

      if (dueGroup(a, today) === 1) {
        const dueDiff = (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
        if (dueDiff !== 0) return dueDiff;
      }

      const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return a.lineNumber - b.lineNumber;
    });
}

function dueGroup(task: ParsedTask, today: string): number {
  if (task.dueDate && task.dueDate <= today) return 0;
  if (task.dueDate) return 1;
  return 2;
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/task-sorter.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/task-sorter.ts tests/task-sorter.test.ts
git commit -m "Rank visible tasks for low-friction execution" \
  -m "PomoVault sorts only actionable tasks so the execution note can tell the user what matters without depending on another plugin." \
  -m "Constraint: Future start dates must stay hidden until actionable" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm test -- tests/task-sorter.test.ts; npm run build" \
  -m "Not-tested: Timezone-specific date boundaries inside Obsidian mobile"
```

## Task 5: Safe Task Writes

**Files:**
- Create: `src/task-writer.ts`
- Create: `tests/task-writer.test.ts`

- [ ] **Step 1: Write task writer tests**

Create `tests/task-writer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { addTaskToSource, completeTaskInSource } from "../src/task-writer";

describe("completeTaskInSource", () => {
  it("marks only the selected source line complete and appends completion date", () => {
    const source = "- [ ] First\n- [ ] Second 📅 2026-05-04";
    const result = completeTaskInSource(source, "Tasks.md:1", "2026-05-02");

    expect(result).toBe("- [ ] First\n- [x] Second 📅 2026-05-04 ✅ 2026-05-02");
  });

  it("does not duplicate completion dates", () => {
    const source = "- [ ] First ✅ 2026-05-01";
    const result = completeTaskInSource(source, "Tasks.md:0", "2026-05-02");

    expect(result).toBe("- [x] First ✅ 2026-05-01");
  });

  it("throws when the selected id does not match a line", () => {
    expect(() => completeTaskInSource("- [ ] First", "Tasks.md:9", "2026-05-02")).toThrow("Task line not found");
  });
});

describe("addTaskToSource", () => {
  it("appends the new task after existing content with one newline", () => {
    const result = addTaskToSource("# Tasks\n- [ ] Existing", {
      text: "New task",
      priority: "high",
      dueDate: "2026-05-04",
      startDate: null,
      recurring: null,
    });

    expect(result).toBe("# Tasks\n- [ ] Existing\n- [ ] New task 📅 2026-05-04 🔼");
  });
});
```

- [ ] **Step 2: Run failing writer tests**

Run:

```bash
npm test -- tests/task-writer.test.ts
```

Expected: FAIL because `src/task-writer.ts` does not exist.

- [ ] **Step 3: Implement safe task writes**

Create `src/task-writer.ts`:

```ts
import { formatTaskLine } from "./task-parser";
import type { AddTaskInput } from "./types";

export function completeTaskInSource(source: string, taskId: string, completionDate: string): string {
  const lineNumber = parseLineNumber(taskId);
  const lines = source.split(/\r?\n/);
  const line = lines[lineNumber];

  if (line === undefined || !/^\s*- \[[ /]\]/.test(line)) {
    throw new Error(`Task line not found for ${taskId}`);
  }

  const completed = line
    .replace(/^(\s*- )\[[ /]\]/, "$1[x]")
    .replace(/\s+$/g, "");

  lines[lineNumber] = /✅\s*\d{4}-\d{2}-\d{2}/u.test(completed)
    ? completed
    : `${completed} ✅ ${completionDate}`;

  return lines.join("\n");
}

export function addTaskToSource(source: string, input: AddTaskInput): string {
  const trimmedEnd = source.replace(/\s+$/g, "");
  const prefix = trimmedEnd.length === 0 ? "" : `${trimmedEnd}\n`;
  return `${prefix}${formatTaskLine(input)}`;
}

function parseLineNumber(taskId: string): number {
  const raw = taskId.split(":").at(-1);
  const lineNumber = Number(raw);
  if (!Number.isInteger(lineNumber) || lineNumber < 0) {
    throw new Error(`Invalid task id ${taskId}`);
  }
  return lineNumber;
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/task-writer.test.ts tests/task-parser.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/task-writer.ts tests/task-writer.test.ts
git commit -m "Write task changes with line-targeted markdown updates" \
  -m "Completion and add-task behavior now transforms source text conservatively before any vault API writes are introduced." \
  -m "Constraint: User vault files must never be rewritten broadly for a single task action" \
  -m "Rejected: Reconstruct the whole task file from parsed tasks | it risks destroying user formatting and comments" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm test -- tests/task-writer.test.ts tests/task-parser.test.ts; npm run build" \
  -m "Not-tested: Concurrent edits from another Obsidian pane between parse and write"
```

## Task 6: Markdown Ledger Writer

**Files:**
- Create: `src/log-writer.ts`
- Create: `tests/log-writer.test.ts`

- [ ] **Step 1: Write ledger tests**

Create `tests/log-writer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { appendLedgerEntry, formatLedgerEntry } from "../src/log-writer";

describe("formatLedgerEntry", () => {
  it("formats a minimal work ledger entry", () => {
    expect(formatLedgerEntry({
      date: "2026-05-02",
      startTime: "09:00",
      endTime: "09:25",
      mode: "work",
      durationMinutes: 25,
      outcome: "Completed",
      taskText: "[[Project Note]] Draft proposal",
    })).toBe("- 09:00-09:25 | Work | 25m | Completed | [[Project Note]] Draft proposal");
  });
});

describe("appendLedgerEntry", () => {
  it("creates a date heading in an empty log", () => {
    const result = appendLedgerEntry("", {
      date: "2026-05-02",
      startTime: "09:00",
      endTime: "09:25",
      mode: "work",
      durationMinutes: 25,
      outcome: "Completed",
      taskText: "Draft proposal",
    });

    expect(result).toBe("## 2026-05-02\n\n- 09:00-09:25 | Work | 25m | Completed | Draft proposal\n");
  });

  it("appends under an existing date heading without rewriting old entries", () => {
    const source = "## 2026-05-02\n\n- 08:00-08:25 | Work | 25m | Completed | First\n";
    const result = appendLedgerEntry(source, {
      date: "2026-05-02",
      startTime: "09:00",
      endTime: "09:25",
      mode: "work",
      durationMinutes: 25,
      outcome: "Reset",
      taskText: "Second",
    });

    expect(result).toBe("## 2026-05-02\n\n- 08:00-08:25 | Work | 25m | Completed | First\n- 09:00-09:25 | Work | 25m | Reset | Second\n");
  });
});
```

- [ ] **Step 2: Run failing ledger tests**

Run:

```bash
npm test -- tests/log-writer.test.ts
```

Expected: FAIL because `src/log-writer.ts` does not exist.

- [ ] **Step 3: Implement ledger formatting and append**

Create `src/log-writer.ts`:

```ts
import type { LedgerEntry, SessionMode } from "./types";

export function formatLedgerEntry(entry: LedgerEntry): string {
  const base = `- ${entry.startTime}-${entry.endTime} | ${formatMode(entry.mode)} | ${entry.durationMinutes}m | ${entry.outcome}`;
  return entry.taskText ? `${base} | ${entry.taskText}` : base;
}

export function appendLedgerEntry(source: string, entry: LedgerEntry): string {
  const normalized = source.replace(/\s+$/g, "");
  const line = formatLedgerEntry(entry);
  const heading = `## ${entry.date}`;

  if (normalized.length === 0) {
    return `${heading}\n\n${line}\n`;
  }

  const lines = normalized.split("\n");
  const headingIndex = lines.findIndex((item) => item.trim() === heading);
  if (headingIndex === -1) {
    return `${normalized}\n\n${heading}\n\n${line}\n`;
  }

  let insertAt = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+\d{4}-\d{2}-\d{2}/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }

  const next = [...lines.slice(0, insertAt), line, ...lines.slice(insertAt)];
  return `${next.join("\n")}\n`;
}

function formatMode(mode: SessionMode): string {
  if (mode === "short-break") return "Short Break";
  if (mode === "long-break") return "Long Break";
  return "Work";
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/log-writer.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/log-writer.ts tests/log-writer.test.ts
git commit -m "Record Pomodoro sessions as append-only markdown ledger entries" \
  -m "The log writer creates compact proof-of-work entries without turning v1 into a journal or rewriting user history." \
  -m "Constraint: Session logging is a v1 feature and must stay vault-native" \
  -m "Rejected: Store logs only in plugin data.json | users asked for markdown inside the vault" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm test -- tests/log-writer.test.ts; npm run build" \
  -m "Not-tested: Huge multi-year log files"
```

## Task 7: Timer Engine

**Files:**
- Create: `src/timer.ts`
- Create: `tests/timer.test.ts`

- [ ] **Step 1: Write timer tests**

Create `tests/timer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialTimerState, PomoTimer } from "../src/timer";

const durations = {
  workSeconds: 25 * 60,
  shortBreakSeconds: 5 * 60,
  longBreakSeconds: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

describe("PomoTimer", () => {
  it("starts a work session with an active task", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));

    timer.start(1000, "task-1", "Draft proposal");

    expect(timer.state.running).toBe(true);
    expect(timer.state.mode).toBe("work");
    expect(timer.state.activeTaskId).toBe("task-1");
    expect(timer.state.activeTaskText).toBe("Draft proposal");
  });

  it("ticks down using elapsed time and pauses safely", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));
    timer.start(1000, "task-1", "Draft proposal");
    timer.tick(61_000);
    timer.pause(61_000);

    expect(timer.state.running).toBe(false);
    expect(timer.state.remainingSeconds).toBe(1440);
  });

  it("advances to short break after a completed work session", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));
    timer.start(0, "task-1", "Draft proposal");
    const event = timer.tick(25 * 60 * 1000);

    expect(event?.completedMode).toBe("work");
    expect(timer.state.mode).toBe("short-break");
    expect(timer.state.remainingSeconds).toBe(5 * 60);
    expect(timer.state.completedWorkSessions).toBe(1);
  });

  it("uses long break after the configured number of work sessions", () => {
    const timer = new PomoTimer(durations, createInitialTimerState({
      ...durations,
      workSeconds: 1,
      shortBreakSeconds: 1,
    }));

    for (let i = 0; i < 7; i += 1) {
      timer.start(i * 1000, null, null);
      timer.tick((i + 1) * 1000);
    }

    expect(timer.state.completedWorkSessions).toBe(4);
    expect(timer.state.mode).toBe("long-break");
  });
});
```

- [ ] **Step 2: Run failing timer tests**

Run:

```bash
npm test -- tests/timer.test.ts
```

Expected: FAIL because `src/timer.ts` does not exist.

- [ ] **Step 3: Implement timer engine**

Create `src/timer.ts` with a pure state engine:

```ts
import type { SessionMode, TimerDurations, TimerState } from "./types";

export interface TimerCompletionEvent {
  completedMode: SessionMode;
  startedAt: number;
  endedAt: number;
  activeTaskId: string | null;
  activeTaskText: string | null;
}

export function createInitialTimerState(durations: TimerDurations): TimerState {
  return {
    mode: "work",
    running: false,
    remainingSeconds: durations.workSeconds,
    completedWorkSessions: 0,
    activeTaskId: null,
    activeTaskText: null,
    sessionStartedAt: null,
    lastTickAt: null,
  };
}

export class PomoTimer {
  constructor(
    private readonly durations: TimerDurations,
    public state: TimerState,
  ) {}

  start(now: number, taskId: string | null, taskText: string | null): void {
    this.state = {
      ...this.state,
      running: true,
      activeTaskId: taskId ?? this.state.activeTaskId,
      activeTaskText: taskText ?? this.state.activeTaskText,
      sessionStartedAt: this.state.sessionStartedAt ?? now,
      lastTickAt: now,
    };
  }

  pause(now: number): void {
    this.tick(now);
    this.state = { ...this.state, running: false, lastTickAt: null };
  }

  reset(now: number): TimerCompletionEvent | null {
    const event = this.state.sessionStartedAt === null ? null : {
      completedMode: this.state.mode,
      startedAt: this.state.sessionStartedAt,
      endedAt: now,
      activeTaskId: this.state.activeTaskId,
      activeTaskText: this.state.activeTaskText,
    };

    this.state = createInitialTimerState(this.durations);
    return event;
  }

  tick(now: number): TimerCompletionEvent | null {
    if (!this.state.running || this.state.lastTickAt === null) return null;

    const elapsedSeconds = Math.max(0, Math.floor((now - this.state.lastTickAt) / 1000));
    if (elapsedSeconds === 0) return null;

    const remainingSeconds = Math.max(0, this.state.remainingSeconds - elapsedSeconds);
    this.state = { ...this.state, remainingSeconds, lastTickAt: now };

    if (remainingSeconds > 0) return null;

    const event: TimerCompletionEvent = {
      completedMode: this.state.mode,
      startedAt: this.state.sessionStartedAt ?? now,
      endedAt: now,
      activeTaskId: this.state.activeTaskId,
      activeTaskText: this.state.activeTaskText,
    };

    this.advanceMode();
    return event;
  }

  private advanceMode(): void {
    if (this.state.mode !== "work") {
      this.state = {
        ...this.state,
        mode: "work",
        running: false,
        remainingSeconds: this.durations.workSeconds,
        activeTaskId: null,
        activeTaskText: null,
        sessionStartedAt: null,
        lastTickAt: null,
      };
      return;
    }

    const completedWorkSessions = this.state.completedWorkSessions + 1;
    const nextMode: SessionMode = completedWorkSessions % this.durations.sessionsBeforeLongBreak === 0
      ? "long-break"
      : "short-break";

    this.state = {
      ...this.state,
      mode: nextMode,
      running: false,
      remainingSeconds: nextMode === "long-break" ? this.durations.longBreakSeconds : this.durations.shortBreakSeconds,
      completedWorkSessions,
      sessionStartedAt: null,
      lastTickAt: null,
    };
  }
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/timer.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/timer.ts tests/timer.test.ts
git commit -m "Keep Pomodoro session state outside markdown rendering" \
  -m "A pure timer engine lets Obsidian re-render the note without resetting active session state." \
  -m "Constraint: Timer state must survive pomoblock re-renders" \
  -m "Confidence: high" \
  -m "Scope-risk: moderate" \
  -m "Tested: npm test -- tests/timer.test.ts; npm run build" \
  -m "Not-tested: Real background throttling on Obsidian mobile"
```

## Task 8: Renderer DOM And Interaction Callbacks

**Files:**
- Create: `src/renderer.ts`
- Create: `tests/renderer.test.ts`
- Modify: `styles.css`

- [ ] **Step 1: Write renderer tests**

Create `tests/renderer.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PomoVaultRenderer } from "../src/renderer";
import type { ParsedTask, TimerState } from "../src/types";

function timerState(overrides: Partial<TimerState> = {}): TimerState {
  return {
    mode: "work",
    running: false,
    remainingSeconds: 1500,
    completedWorkSessions: 0,
    activeTaskId: null,
    activeTaskText: null,
    sessionStartedAt: null,
    lastTickAt: null,
    ...overrides,
  };
}

function task(overrides: Partial<ParsedTask> = {}): ParsedTask {
  return {
    id: "Tasks.md:0",
    filePath: "Tasks.md",
    lineNumber: 0,
    originalLine: "- [ ] Draft proposal",
    indentation: "",
    status: "todo",
    text: "Draft [[Project]] proposal",
    displayText: "Draft [[Project]] proposal",
    priority: "urgent",
    dueDate: "2026-05-02",
    startDate: null,
    recurring: "every week",
    completedDate: null,
    ...overrides,
  };
}

describe("PomoVaultRenderer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders timer, active task, and task rows", () => {
    const root = document.createElement("div");
    const renderer = new PomoVaultRenderer({
      onStartTask: vi.fn(),
      onCompleteTask: vi.fn(),
      onAddTask: vi.fn(),
      onPause: vi.fn(),
      onReset: vi.fn(),
      onOpenLink: vi.fn(),
    });

    renderer.render(root, {
      timer: timerState({ activeTaskText: "Draft proposal" }),
      tasks: [task()],
      today: "2026-05-02",
      settings: {
        showPriorityBadges: true,
        showDates: true,
        showRecurringIndicator: true,
        nowWorkingHeading: "H2",
        nowWorkingCallout: "warning",
      },
    });

    expect(root.querySelector(".pomovault__timer")?.textContent).toContain("25:00");
    expect(root.textContent).toContain("Draft proposal");
    expect(root.textContent).toContain("URGENT");
    expect(root.textContent).toContain("2026-05-02");
  });

  it("calls task actions when buttons are clicked", () => {
    const root = document.createElement("div");
    const onStartTask = vi.fn();
    const onCompleteTask = vi.fn();
    const renderer = new PomoVaultRenderer({
      onStartTask,
      onCompleteTask,
      onAddTask: vi.fn(),
      onPause: vi.fn(),
      onReset: vi.fn(),
      onOpenLink: vi.fn(),
    });

    renderer.render(root, {
      timer: timerState(),
      tasks: [task()],
      today: "2026-05-02",
      settings: {
        showPriorityBadges: true,
        showDates: true,
        showRecurringIndicator: true,
        nowWorkingHeading: "H2",
        nowWorkingCallout: "warning",
      },
    });

    root.querySelector<HTMLButtonElement>("[data-action='start-task']")?.click();
    root.querySelector<HTMLButtonElement>("[data-action='complete-task']")?.click();

    expect(onStartTask).toHaveBeenCalledWith("Tasks.md:0");
    expect(onCompleteTask).toHaveBeenCalledWith("Tasks.md:0");
  });
});
```

- [ ] **Step 2: Run failing renderer tests**

Run:

```bash
npm test -- tests/renderer.test.ts --environment jsdom
```

Expected: FAIL because `src/renderer.ts` does not exist.

- [ ] **Step 3: Implement renderer**

Create `src/renderer.ts` with:

```ts
import type { ParsedTask, TimerState } from "./types";

export interface RendererSettings {
  showPriorityBadges: boolean;
  showDates: boolean;
  showRecurringIndicator: boolean;
  nowWorkingHeading: "H1" | "H2" | "H3";
  nowWorkingCallout: "warning" | "info" | "tip" | "danger" | "success";
}

export interface RenderState {
  timer: TimerState;
  tasks: ParsedTask[];
  today: string;
  settings: RendererSettings;
}

export interface RendererActions {
  onStartTask(taskId: string): void;
  onCompleteTask(taskId: string): void;
  onAddTask(): void;
  onPause(): void;
  onReset(): void;
  onOpenLink(linkText: string): void;
}

export class PomoVaultRenderer {
  constructor(private readonly actions: RendererActions) {}

  render(root: HTMLElement, state: RenderState): void {
    root.replaceChildren();
    root.classList.add("pomovault");

    root.append(
      this.renderTimer(state.timer),
      this.renderNowWorking(state),
      this.renderTaskList(state),
    );
  }

  private renderTimer(timer: TimerState): HTMLElement {
    const section = document.createElement("section");
    section.className = "pomovault__panel pomovault__timer-panel";

    const label = document.createElement("div");
    label.className = "pomovault__mode";
    label.textContent = `${formatMode(timer.mode)} · Session ${timer.completedWorkSessions + 1}/4`;

    const display = document.createElement("div");
    display.className = "pomovault__timer";
    display.textContent = formatSeconds(timer.remainingSeconds);
    if (timer.remainingSeconds <= 60) display.classList.add("pomovault__timer--danger");

    const controls = document.createElement("div");
    controls.className = "pomovault__controls";
    controls.append(
      button("Pause", "pause", () => this.actions.onPause()),
      button("Reset", "reset", () => this.actions.onReset()),
    );

    section.append(label, display, controls);
    return section;
  }

  private renderNowWorking(state: RenderState): HTMLElement {
    const section = document.createElement("section");
    section.className = `pomovault__panel pomovault__now pomovault__now--${state.settings.nowWorkingCallout}`;

    const heading = document.createElement(state.settings.nowWorkingHeading.toLowerCase());
    heading.textContent = "NOW WORKING ON";

    const content = document.createElement("p");
    content.textContent = state.timer.activeTaskText ?? "No active task. Start one from the list.";

    section.append(heading, content);
    return section;
  }

  private renderTaskList(state: RenderState): HTMLElement {
    const section = document.createElement("section");
    section.className = "pomovault__panel";

    const header = document.createElement("div");
    header.className = "pomovault__task-header";
    const title = document.createElement("h3");
    title.textContent = "Tasks";
    header.append(title, button("+ Add Task", "add-task", () => this.actions.onAddTask()));

    const list = document.createElement("div");
    list.className = "pomovault__tasks";
    for (const task of state.tasks) {
      list.append(this.renderTask(task, state));
    }

    section.append(header, list);
    return section;
  }

  private renderTask(task: ParsedTask, state: RenderState): HTMLElement {
    const row = document.createElement("article");
    row.className = "pomovault__task";

    row.append(button("▶ Start", "start-task", () => this.actions.onStartTask(task.id)));

    if (state.settings.showPriorityBadges) {
      const priority = document.createElement("span");
      priority.className = `pomovault__priority pomovault__priority--${task.priority}`;
      priority.textContent = task.priority.toUpperCase();
      row.append(priority);
    }

    const text = document.createElement("span");
    text.className = "pomovault__task-text";
    text.textContent = task.displayText;
    row.append(text);

    if (state.settings.showRecurringIndicator && task.recurring) {
      const recurring = document.createElement("span");
      recurring.className = "pomovault__recurring";
      recurring.textContent = "↺";
      row.append(recurring);
    }

    if (state.settings.showDates && task.dueDate) {
      const due = document.createElement("span");
      due.className = task.dueDate <= state.today ? "pomovault__date pomovault__date--due" : "pomovault__date";
      due.textContent = task.dueDate;
      row.append(due);
    }

    row.append(button("✓ Done", "complete-task", () => this.actions.onCompleteTask(task.id)));
    return row;
  }
}

function button(label: string, action: string, onClick: () => void): HTMLButtonElement {
  const item = document.createElement("button");
  item.type = "button";
  item.dataset.action = action;
  item.textContent = label;
  item.addEventListener("click", onClick);
  return item;
}

function formatSeconds(value: number): string {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatMode(mode: TimerState["mode"]): string {
  if (mode === "short-break") return "Short Break";
  if (mode === "long-break") return "Long Break";
  return "Work";
}
```

- [ ] **Step 4: Expand `styles.css`**

Append this CSS under the existing `.pomovault` block:

```css
.pomovault {
  display: grid;
  gap: 1rem;
}

.pomovault__panel {
  border: 1px solid var(--pv-border);
  border-radius: 8px;
  background: var(--pv-surface);
  padding: 1rem;
}

.pomovault__timer-panel {
  display: grid;
  gap: 0.75rem;
}

.pomovault__mode {
  color: var(--pv-muted);
  font-size: var(--font-ui-small);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pomovault__timer {
  font-family: var(--font-monospace);
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 1;
}

.pomovault__timer--danger {
  color: var(--pv-danger);
}

.pomovault__controls,
.pomovault__task-header,
.pomovault__task {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pomovault__task-header {
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.pomovault__tasks {
  display: grid;
  gap: 0.5rem;
}

.pomovault__task {
  border-top: 1px solid var(--pv-border);
  padding-top: 0.5rem;
}

.pomovault__task-text {
  flex: 1 1 16rem;
}

.pomovault__priority,
.pomovault__date,
.pomovault__recurring {
  border: 1px solid var(--pv-border);
  border-radius: 999px;
  color: var(--pv-muted);
  font-size: var(--font-ui-smaller);
  padding: 0.1rem 0.45rem;
}

.pomovault__priority--urgent,
.pomovault__date--due {
  border-color: var(--pv-danger);
  color: var(--pv-danger);
}

.pomovault__priority--highest {
  border-color: var(--color-orange);
  color: var(--color-orange);
}

.pomovault__priority--high {
  border-color: var(--color-yellow);
  color: var(--color-yellow);
}
```

Run:

```bash
npm test -- tests/renderer.test.ts --environment jsdom
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/renderer.ts tests/renderer.test.ts styles.css
git commit -m "Render the PomoVault execution surface" \
  -m "The renderer draws timer, active work, task rows, and callbacks without owning vault writes or timer state." \
  -m "Constraint: Markdown code block rendering must survive Obsidian refreshes" \
  -m "Confidence: medium" \
  -m "Scope-risk: moderate" \
  -m "Tested: npm test -- tests/renderer.test.ts --environment jsdom; npm run build" \
  -m "Not-tested: Full Obsidian theme matrix"
```

## Task 9: Vault Services And Plugin Wiring

**Files:**
- Create: `src/obsidian-services.ts`
- Create: `tests/obsidian-services.test.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Write service tests with fakes**

Create `tests/obsidian-services.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createExecutionNoteContent, todayLocalDate } from "../src/obsidian-services";

describe("createExecutionNoteContent", () => {
  it("creates the pomoblock note body", () => {
    expect(createExecutionNoteContent()).toContain("```pomoblock");
    expect(createExecutionNoteContent()).toContain("PomoVault");
  });
});

describe("todayLocalDate", () => {
  it("formats local dates as yyyy-mm-dd", () => {
    expect(todayLocalDate(new Date("2026-05-02T12:00:00"))).toBe("2026-05-02");
  });
});
```

- [ ] **Step 2: Implement service helpers**

Create `src/obsidian-services.ts`:

```ts
import type { App, TFile } from "obsidian";
import { EXECUTION_NOTE, TASK_BLOCK_LANGUAGE } from "./constants";

export function createExecutionNoteContent(): string {
  return [
    "# PomoVault",
    "",
    "```" + TASK_BLOCK_LANGUAGE,
    "```",
    "",
  ].join("\n");
}

export function todayLocalDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function ensureMarkdownFile(app: App, path: string, content: string): Promise<TFile> {
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing && "extension" in existing && existing.extension === "md") {
    return existing as TFile;
  }
  return app.vault.create(path || EXECUTION_NOTE, content);
}

export async function readFile(app: App, path: string): Promise<string> {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file || !("extension" in file)) {
    throw new Error(`File not found: ${path}`);
  }
  return app.vault.read(file as TFile);
}

export async function overwriteFile(app: App, path: string, source: string): Promise<void> {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file || !("extension" in file)) {
    await app.vault.create(path, source);
    return;
  }
  await app.vault.modify(file as TFile, source);
}
```

- [ ] **Step 3: Replace `src/main.ts` with integrated plugin wiring**

Use this file content after Task 9. Task 10 will replace the Add Task notice with the modal.

```ts
import { Notice, Plugin } from "obsidian";
import { TASK_BLOCK_LANGUAGE } from "./constants";
import { appendLedgerEntry } from "./log-writer";
import { ensureMarkdownFile, createExecutionNoteContent, overwriteFile, readFile, todayLocalDate } from "./obsidian-services";
import { PomoVaultRenderer } from "./renderer";
import { DEFAULT_SETTINGS, normalizeSettings } from "./settings";
import { parseTasks } from "./task-parser";
import { getVisibleSortedTasks } from "./task-sorter";
import { completeTaskInSource } from "./task-writer";
import { createInitialTimerState, PomoTimer } from "./timer";
import type { LedgerEntry, PomoVaultSettings, TimerDurations } from "./types";

export default class PomoVaultPlugin extends Plugin {
  settings: PomoVaultSettings = DEFAULT_SETTINGS;
  private timer = new PomoTimer(this.createDurations(), createInitialTimerState(this.createDurations()));
  private renderRoots = new Set<HTMLElement>();

  async onload(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
    this.timer = new PomoTimer(this.createDurations(), createInitialTimerState(this.createDurations()));

    await ensureMarkdownFile(this.app, this.settings.executionNotePath, createExecutionNoteContent());

    this.registerMarkdownCodeBlockProcessor(TASK_BLOCK_LANGUAGE, async (_source, el) => {
      await this.renderPomoBlock(el);
    });

    this.addCommand({ id: "open-pomovault", name: "Open PomoVault", callback: () => void this.openExecutionNote() });
    this.addCommand({ id: "pause-pomovault", name: "Pause PomoVault timer", callback: () => this.pauseTimer() });
    this.addCommand({ id: "reset-pomovault", name: "Reset PomoVault timer", callback: () => void this.resetTimer() });

    this.registerInterval(window.setInterval(() => void this.tickTimer(), 1000));
  }

  async saveSettings(): Promise<void> {
    this.settings = normalizeSettings(this.settings);
    await this.saveData(this.settings);
  }

  async onunload(): Promise<void> {
    await this.saveSettings();
  }

  private async renderPomoBlock(el: HTMLElement): Promise<void> {
    this.renderRoots.add(el);
    const tasks = await this.loadVisibleTasks();
    const renderer = new PomoVaultRenderer({
      onStartTask: (taskId) => void this.startTask(taskId),
      onCompleteTask: (taskId) => void this.completeTask(taskId),
      onAddTask: () => new Notice("Add Task modal lands in the next implementation task."),
      onPause: () => this.pauseTimer(),
      onReset: () => void this.resetTimer(),
      onOpenLink: (linkText) => {
        void this.app.workspace.openLinkText(linkText, this.settings.executionNotePath);
      },
    });

    renderer.render(el, {
      timer: this.timer.state,
      tasks,
      today: todayLocalDate(),
      settings: this.settings,
    });
  }

  private async rerenderAll(): Promise<void> {
    await Promise.all(Array.from(this.renderRoots).map((root) => this.renderPomoBlock(root)));
  }

  private async loadVisibleTasks() {
    if (!this.settings.taskSourcePath) return [];
    const source = await readFile(this.app, this.settings.taskSourcePath);
    return getVisibleSortedTasks(parseTasks(source, this.settings.taskSourcePath), todayLocalDate());
  }

  private async startTask(taskId: string): Promise<void> {
    const tasks = await this.loadVisibleTasks();
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
      new Notice("Task no longer exists.");
      return;
    }
    this.timer.start(Date.now(), task.id, task.text);
    await this.rerenderAll();
  }

  private pauseTimer(): void {
    this.timer.pause(Date.now());
    void this.rerenderAll();
  }

  private async resetTimer(): Promise<void> {
    const event = this.timer.reset(Date.now());
    if (event?.completedMode === "work") {
      await this.appendLedger("Reset", event.startedAt, event.endedAt, event.activeTaskText);
    }
    await this.rerenderAll();
  }

  private async tickTimer(): Promise<void> {
    const event = this.timer.tick(Date.now());
    if (event?.completedMode === "work") {
      await this.appendLedger("Completed", event.startedAt, event.endedAt, event.activeTaskText);
      await this.rerenderAll();
    }
  }

  private async completeTask(taskId: string): Promise<void> {
    if (!this.settings.taskSourcePath) return;
    const source = await readFile(this.app, this.settings.taskSourcePath);
    const updated = completeTaskInSource(source, taskId, todayLocalDate());
    await overwriteFile(this.app, this.settings.taskSourcePath, updated);
    await this.rerenderAll();
  }

  private async appendLedger(outcome: LedgerEntry["outcome"], startedAt: number, endedAt: number, taskText: string | null): Promise<void> {
    const source = await readFile(this.app, this.settings.logPath).catch(() => "");
    const entry: LedgerEntry = {
      date: todayLocalDate(new Date(endedAt)),
      startTime: formatTime(startedAt),
      endTime: formatTime(endedAt),
      mode: "work",
      durationMinutes: Math.max(1, Math.round((endedAt - startedAt) / 60000)),
      outcome,
      taskText,
    };
    await overwriteFile(this.app, this.settings.logPath, appendLedgerEntry(source, entry));
  }

  private async openExecutionNote(): Promise<void> {
    const file = await ensureMarkdownFile(this.app, this.settings.executionNotePath, createExecutionNoteContent());
    await this.app.workspace.getLeaf(false).openFile(file);
  }

  private createDurations(): TimerDurations {
    return {
      workSeconds: this.settings.workMinutes * 60,
      shortBreakSeconds: this.settings.shortBreakMinutes * 60,
      longBreakSeconds: this.settings.longBreakMinutes * 60,
      sessionsBeforeLongBreak: this.settings.sessionsBeforeLongBreak,
    };
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/obsidian-services.test.ts tests/task-parser.test.ts tests/task-sorter.test.ts tests/task-writer.test.ts tests/log-writer.test.ts tests/timer.test.ts
npm run build
```

Expected: PASS.

Commit:

```bash
git add src/main.ts src/obsidian-services.ts tests/obsidian-services.test.ts
git commit -m "Wire PomoVault into Obsidian vault APIs" \
  -m "The plugin now creates the execution note, processes pomoblocks, and connects pure domain modules to conservative vault reads and writes." \
  -m "Constraint: Vault writes must go through a narrow service boundary" \
  -m "Confidence: medium" \
  -m "Scope-risk: moderate" \
  -m "Tested: npm test targeted service and domain suites; npm run build" \
  -m "Not-tested: Manual Obsidian first-run flow"
```

## Task 10: Settings Tab And Add Task Modal

**Files:**
- Create: `src/task-modal.ts`
- Modify: `src/settings.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Add settings tab class**

Append this settings tab implementation to `src/settings.ts` and update imports to include `App`, `Plugin`, `PluginSettingTab`, and `Setting` from `obsidian`:

```ts
import type { App, Plugin } from "obsidian";
import { PluginSettingTab, Setting } from "obsidian";

export type PomoVaultSettingsHost = Plugin & {
  settings: PomoVaultSettings;
  saveSettings(): Promise<void>;
};

export class PomoVaultSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly host: PomoVaultSettingsHost) {
    super(app, host);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PomoVault" });

    this.textSetting("Task source file", "Tasks.md", "taskSourcePath");
    this.textSetting("Log file", "PomoVault Log.md", "logPath");
    this.numberSetting("Work minutes", "25", "workMinutes");
    this.numberSetting("Short break minutes", "5", "shortBreakMinutes");
    this.numberSetting("Long break minutes", "15", "longBreakMinutes");
    this.numberSetting("Sessions before long break", "4", "sessionsBeforeLongBreak");
    this.toggleSetting("Auto-advance", "autoAdvance");
    this.toggleSetting("Sound on completion", "soundOnCompletion");
    this.toggleSetting("Log breaks", "logBreaks");
    this.toggleSetting("Show priority badges", "showPriorityBadges");
    this.toggleSetting("Show dates", "showDates");
    this.toggleSetting("Show recurring indicator", "showRecurringIndicator");
  }

  private textSetting(name: string, placeholder: string, key: "taskSourcePath" | "logPath"): void {
    new Setting(this.containerEl)
      .setName(name)
      .addText((text) => text
        .setPlaceholder(placeholder)
        .setValue(this.host.settings[key])
        .onChange(async (value) => {
          this.host.settings[key] = value.trim();
          await this.host.saveSettings();
        }));
  }

  private numberSetting(name: string, placeholder: string, key: "workMinutes" | "shortBreakMinutes" | "longBreakMinutes" | "sessionsBeforeLongBreak"): void {
    new Setting(this.containerEl)
      .setName(name)
      .addText((text) => text
        .setPlaceholder(placeholder)
        .setValue(String(this.host.settings[key]))
        .onChange(async (value) => {
          this.host.settings[key] = Number(value);
          await this.host.saveSettings();
        }));
  }

  private toggleSetting(name: string, key: "autoAdvance" | "soundOnCompletion" | "logBreaks" | "showPriorityBadges" | "showDates" | "showRecurringIndicator"): void {
    new Setting(this.containerEl)
      .setName(name)
      .addToggle((toggle) => toggle
        .setValue(this.host.settings[key])
        .onChange(async (value) => {
          this.host.settings[key] = value;
          await this.host.saveSettings();
        }));
  }
}
```

- [ ] **Step 2: Create add-task modal**

Create `src/task-modal.ts`:

```ts
import { Modal, Setting } from "obsidian";
import type { AddTaskInput, Priority } from "./types";

export class PomoVaultTaskModal extends Modal {
  private text = "";
  private priority: Priority = "normal";
  private dueDate: string | null = null;
  private startDate: string | null = null;
  private recurring: string | null = null;

  constructor(app: ConstructorParameters<typeof Modal>[0], private readonly onSubmit: (input: AddTaskInput) => Promise<void>) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Add PomoVault Task" });

    new Setting(contentEl).setName("Task").addText((text) => {
      text.onChange((value) => { this.text = value; });
    });

    new Setting(contentEl).setName("Priority").addDropdown((dropdown) => {
      for (const value of ["urgent", "highest", "high", "normal", "low", "lowest"] as Priority[]) {
        dropdown.addOption(value, value.toUpperCase());
      }
      dropdown.setValue(this.priority);
      dropdown.onChange((value) => { this.priority = value as Priority; });
    });

    new Setting(contentEl).setName("Due date").addText((text) => {
      text.setPlaceholder("2026-05-04");
      text.onChange((value) => { this.dueDate = value.trim() || null; });
    });

    new Setting(contentEl).setName("Start date").addText((text) => {
      text.setPlaceholder("2026-05-03");
      text.onChange((value) => { this.startDate = value.trim() || null; });
    });

    new Setting(contentEl).setName("Recurring").addText((text) => {
      text.setPlaceholder("every week");
      text.onChange((value) => { this.recurring = value.trim() || null; });
    });

    new Setting(contentEl).addButton((button) => {
      button.setButtonText("Save task").setCta().onClick(async () => {
        if (!this.text.trim()) return;
        await this.onSubmit({
          text: this.text,
          priority: this.priority,
          dueDate: this.dueDate,
          startDate: this.startDate,
          recurring: this.recurring,
        });
        this.close();
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
```

- [ ] **Step 3: Wire modal and settings into `main.ts`**

Add:

```ts
this.addSettingTab(new PomoVaultSettingTab(this.app, this));
```

Add plugin methods:

```ts
async saveSettings(): Promise<void> {
  this.settings = normalizeSettings(this.settings);
  await this.saveData(this.settings);
}
```

Use `PomoVaultTaskModal` for renderer `onAddTask`.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm run build
npm test
```

Expected: PASS.

Commit:

```bash
git add src/settings.ts src/task-modal.ts src/main.ts
git commit -m "Add first-run configuration and task entry controls" \
  -m "Settings and task creation keep the workflow vault-native while giving users enough control over source paths, timer durations, and logging behavior." \
  -m "Constraint: V1 supports one task source and one log path" \
  -m "Confidence: medium" \
  -m "Scope-risk: moderate" \
  -m "Tested: npm run build; npm test" \
  -m "Not-tested: Manual keyboard navigation through modal fields"
```

## Task 11: Static Website

**Files:**
- Create: `site/package.json`
- Create: `site/package-lock.json`
- Create: `site/index.html`
- Create: `site/vite.config.ts`
- Create: `site/tailwind.config.ts`
- Create: `site/postcss.config.js`
- Create: `site/src/main.tsx`
- Create: `site/src/App.tsx`
- Create: `site/src/content.ts`
- Create: `site/src/styles.css`
- Create: `CNAME`

- [ ] **Step 1: Scaffold Vite React app dependencies**

Run:

```bash
mkdir -p site/src
npm --prefix site install react react-dom
npm --prefix site install --save-dev @vitejs/plugin-react autoprefixer postcss tailwindcss typescript vite
```

Expected: `site/package.json` and `site/package-lock.json` exist.

- [ ] **Step 2: Set site package metadata and scripts**

Keep the npm-written `dependencies` and `devDependencies` blocks exactly as npm created them. Replace the metadata and scripts with this shape:

```json
{
  "name": "pomovault-site",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4173"
  }
}
```

- [ ] **Step 3: Create Vite, Tailwind, and React files**

Create `site/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
});
```

Create `site/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        terminal: "#0a0a0f",
        panel: "#12121a",
        card: "#16161f",
        cyan: "#00ffff",
        magenta: "#ff00ff",
        green: "#00ff88",
        muted: "#8b8b9e",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Create `site/postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `site/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="PomoVault: Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown." />
    <title>PomoVault</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `site/src/main.tsx`:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Create `site/src/content.ts`:

```ts
export const siteContent = {
  nav: ["Workflow", "Features", "Docs", "GitHub"],
  headline: "PomoVault",
  subhead: "Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.",
  proofLines: [
    "- [ ] Draft launch post 📅 2026-05-04 ⏫",
    "25:00 · Work · Session 1/4",
    "09:00-09:25 | Work | 25m | Completed | Draft launch post",
  ],
};
```

Create `site/src/App.tsx` with a full homepage:

```tsx
import { siteContent } from "./content";

export function App() {
  return (
    <main className="min-h-screen bg-terminal text-zinc-100">
      <header className="border-b border-cyan/20 bg-terminal/90 px-6 py-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between font-mono">
          <a className="text-xl font-bold text-zinc-100" href="/">
            <span className="text-cyan">&gt;</span> PomoVault
          </a>
          <div className="hidden gap-6 text-sm uppercase tracking-wide text-muted md:flex">
            {siteContent.nav.map((item) => (
              <a key={item} className="hover:text-cyan" href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <div>
          <p className="font-mono text-sm text-green">// focus_protocol</p>
          <h1 className="mt-4 font-mono text-5xl font-bold md:text-7xl">{siteContent.headline}</h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-zinc-300">{siteContent.subhead}</p>
          <div className="mt-8 flex flex-wrap gap-4 font-mono text-sm uppercase tracking-widest">
            <a className="border-2 border-cyan px-5 py-3 text-cyan hover:bg-cyan hover:text-terminal" href="https://github.com/ericgrill/pomovault">
              View GitHub
            </a>
            <a className="border border-magenta px-5 py-3 text-magenta hover:bg-magenta hover:text-terminal" href="#docs">
              Install Notes
            </a>
          </div>
        </div>

        <div className="border border-cyan/30 bg-card p-5 font-mono shadow-[0_0_30px_rgba(0,255,255,0.12)]">
          <p className="text-sm text-cyan">$ pomo start</p>
          <div className="mt-4 space-y-3">
            {siteContent.proofLines.map((line) => (
              <div key={line} className="border border-zinc-800 bg-terminal p-3 text-sm text-zinc-300">
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-zinc-800 bg-panel px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm text-cyan">// execution_loop</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Choose the next task", "Run the Pomodoro", "Log proof of work"].map((item, index) => (
              <article key={item} className="border border-zinc-800 bg-card p-5">
                <p className="font-mono text-sm text-green">0{index + 1}</p>
                <h2 className="mt-3 font-mono text-xl">{item}</h2>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-sm text-magenta">// what_ships</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {["Self-contained Pomodoro timer", "Integrated markdown task manager", "Minimal session ledger", "No Dataview or Tasks dependency"].map((feature) => (
            <div key={feature} className="border border-zinc-800 bg-card p-5 text-zinc-300">
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section id="docs" className="border-t border-zinc-800 bg-panel px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm text-green">// install_notes</p>
          <h2 className="mt-4 font-mono text-3xl">Built for the vault. Documented for humans.</h2>
          <p className="mt-4 max-w-3xl text-zinc-300">
            Setup docs will cover installation, task syntax, timer commands, logging behavior, and release notes.
          </p>
        </div>
      </section>
    </main>
  );
}
```

Create `site/src/styles.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  background: #0a0a0f;
}

body {
  margin: 0;
  background: #0a0a0f;
}

::selection {
  background: #00ffff;
  color: #0a0a0f;
}
```

Create `CNAME`:

```text
pomovault.com
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm --prefix site run build
npm run site:build
```

Expected: PASS and `site/dist` exists.

Commit:

```bash
git add site CNAME package.json package-lock.json
git commit -m "Create the static PomoVault product site" \
  -m "The website uses Vite and React to ship a static GitHub Pages site with ericgrill.com-style terminal voice and proof-oriented product copy." \
  -m "Constraint: pomovault.com should not require a server runtime" \
  -m "Rejected: Next.js | GitHub Pages with a Vite build is enough for static product docs" \
  -m "Confidence: high" \
  -m "Scope-risk: moderate" \
  -m "Tested: npm --prefix site run build; npm run site:build" \
  -m "Not-tested: Live GitHub Pages deployment and DNS"
```

## Task 12: GitHub Pages And Release Workflows

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `.github/workflows/plugin-release.yml`
- Create: `docs/release-checklist.md`
- Create: `docs/development.md`

- [ ] **Step 1: Create GitHub Pages workflow**

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy site to GitHub Pages

on:
  push:
    branches: ["main"]
    paths:
      - "site/**"
      - ".github/workflows/pages.yml"
      - "CNAME"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
        working-directory: site
      - run: npm run build
        working-directory: site
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: site/dist
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Create plugin release packaging workflow**

Create `.github/workflows/plugin-release.yml`:

```yaml
name: Build plugin release assets

on:
  push:
    tags:
      - "*.*.*"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: mkdir -p dist/plugin && cp main.js manifest.json styles.css dist/plugin/
      - uses: actions/upload-artifact@v5
        with:
          name: pomovault-plugin
          path: dist/plugin
```

- [ ] **Step 3: Create release and development docs**

Create `docs/release-checklist.md`:

```markdown
# PomoVault Release Checklist

## Local verification

- Run `npm run verify`.
- Install `main.js`, `manifest.json`, and `styles.css` into a dedicated test vault under `.obsidian/plugins/pomovault/`.
- Enable PomoVault in Obsidian Community plugins.
- Confirm `PomoVault.md` is created.
- Confirm a task source note can be configured.
- Confirm starting, pausing, resetting, and completing a task works.
- Confirm `PomoVault Log.md` receives work-session ledger entries.
- Confirm the site builds with `npm --prefix site run build`.

## GitHub Pages

- In repository Settings -> Pages, set Source to GitHub Actions.
- Set custom domain to `pomovault.com`.
- Configure DNS for GitHub Pages.
- Enforce HTTPS after certificate provisioning succeeds.

## Obsidian community plugin release

- Ensure `manifest.json` version matches the Git tag.
- Create a GitHub release whose tag matches `manifest.json`.
- Attach `main.js`, `manifest.json`, and `styles.css`.
- Submit to `obsidianmd/obsidian-releases` with id `pomovault`, name `PomoVault`, author `Eric Grill`, and the repository path.
```

Create `docs/development.md`:

```markdown
# Development

## Plugin

```bash
npm install
npm test
npm run build
```

## Website

```bash
npm --prefix site install
npm --prefix site run build
npm --prefix site run preview
```

## Verification

```bash
npm run verify
```
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm run verify
git diff --check
```

Expected: PASS.

Commit:

```bash
git add .github/workflows/pages.yml .github/workflows/plugin-release.yml docs/release-checklist.md docs/development.md
git commit -m "Document deployment and release automation" \
  -m "GitHub Actions now describes static site deployment and plugin release asset packaging while keeping DNS and registry submission as explicit external steps." \
  -m "Constraint: External publishing needs repository and DNS authority" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm run verify; git diff --check" \
  -m "Not-tested: Live GitHub Actions execution"
```

## Task 13: Full Verification Loop And Polish Pass

**Files:**
- Modify any files required to resolve verification failures.
- Modify: `README.md`
- Modify: `PomoVault PRD.md`
- Modify: `docs/superpowers/specs/2026-05-02-pomovault-product-design.md` only if implementation intentionally diverged.

- [ ] **Step 1: Update PRD to reflect approved decisions**

Edit `PomoVault PRD.md`:

- Move session logging from v1.1 into MVP.
- Add static React/Tailwind GitHub Pages website to launch deliverables.
- Standardize `pomovault.com`.
- Record `pomovault` as the plugin id unless a collision is discovered during external registry review.

- [ ] **Step 2: Expand README with user-facing setup**

README must include:

- What PomoVault does.
- Current development status.
- Build commands.
- Task syntax examples.
- Logging example.
- Link to `docs/development.md`.
- Link to `docs/release-checklist.md`.

- [ ] **Step 3: Run full local verification**

Run:

```bash
npm run verify
git diff --check
git status --short
```

Expected:

- `npm test` passes.
- Plugin build passes.
- Site build passes.
- `git diff --check` reports no whitespace errors.
- `git status --short` shows only intentional modified/untracked files before final commit.

- [ ] **Step 4: If verification fails, run the repair loop**

For each failure:

```bash
# Inspect the failing command output.
# Patch the smallest relevant file.
# Rerun the exact command that failed.
# Continue until it passes.
```

Do not ask the user about local failures. Keep repairing until the suite passes or until the failure requires external credentials, DNS, or Obsidian GUI-only access. For GUI-only verification, document the exact manual step in `docs/release-checklist.md`.

- [ ] **Step 5: Commit final polish**

Commit:

```bash
git add README.md 'PomoVault PRD.md' docs/superpowers/specs/2026-05-02-pomovault-product-design.md docs/release-checklist.md docs/development.md .
git commit -m "Align documentation with the implemented PomoVault v1 slice" \
  -m "The README, PRD, and release notes now match the implemented plugin, markdown ledger, and static GitHub Pages site." \
  -m "Constraint: Launch docs must reflect logging as part of v1" \
  -m "Confidence: high" \
  -m "Scope-risk: narrow" \
  -m "Tested: npm run verify; git diff --check" \
  -m "Not-tested: DNS, GitHub Pages production deployment, and Obsidian community registry submission"
```

## Final Completion Criteria

Do not report completion until all local criteria are true:

- `npm test` passes.
- `npm run build` passes.
- `npm --prefix site run build` passes.
- `npm run verify` passes.
- `git diff --check` passes.
- Working tree is clean after final commit, or only intentionally uncommitted local runtime files are ignored.
- `docs/release-checklist.md` lists every external action not performed locally.
- Final response includes commits made, changed files summary, verification evidence, and remaining external risks.

## Spec Coverage Review

- First-run `PomoVault.md`: Task 9.
- Single task source: Tasks 2, 9, 10.
- `pomoblock`: Tasks 2, 8, 9.
- Timer cycle: Task 7.
- Start, pause, reset, complete: Tasks 7, 8, 9.
- Task parsing and sorting: Tasks 3, 4.
- Safe write-back: Task 5.
- Add Task modal: Task 10.
- Markdown ledger: Task 6 and Task 9 wiring.
- Settings tab: Task 10.
- Static website: Task 11.
- GitHub Pages: Task 12.
- Release docs: Task 12 and Task 13.
- Verification loop: Task 13.
