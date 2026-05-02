// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { TFile } from "obsidian";
import PomoVaultPlugin from "../src/main";
import { PomoVaultSetupModal } from "../src/setup-modal";
import type { PomoVaultSettings } from "../src/types";

const storedSettings: Partial<PomoVaultSettings> = {
  executionNotePath: "PomoVault.md",
  taskSourcePath: "Tasks.md",
  logPath: "PomoVault Log.md",
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  autoAdvance: false,
  soundOnCompletion: false,
};

describe("PomoVaultPlugin integration", () => {
  it("renders a task, starts it, completes it safely, and logs a completed work session", async () => {
    const files = new Map<string, string>([
      ["Tasks.md", "- [ ] Draft launch post 📅 2026-05-04 ⏫\n"],
    ]);
    const { plugin, processor } = await loadPlugin(files, storedSettings);
    const root = document.createElement("div");

    await processor("", root);

    expect(root.textContent).toContain("Draft launch post");
    root.querySelector<HTMLButtonElement>("[data-action='start-task']")?.click();
    expect(root.textContent).toContain("Draft launch post");

    root.querySelector<HTMLButtonElement>("[data-action='complete-task']")?.click();

    await vi.waitFor(() => {
      expect(files.get("Tasks.md")).toContain("- [x] Draft launch post");
    });

    const endedAt = Date.now();
    const timer = plugin.timer;
    timer.state = {
      ...timer.state,
      running: true,
      remainingSeconds: 1,
      activeTaskId: "Tasks.md:0",
      activeTaskText: "Draft launch post",
      sessionStartedAt: endedAt - (25 * 60 * 1000),
      lastTickAt: endedAt - 1000,
    };

    await plugin.tickTimer();

    expect(files.get("PomoVault Log.md")).toContain("Work | 25m | Completed | Draft launch post");
  });

  it("opens the setup prompt on first run after creating the execution note", async () => {
    const files = new Map<string, string>();
    const open = vi.spyOn(PomoVaultSetupModal.prototype, "open").mockImplementation(() => undefined);
    const layoutCallbacks: Array<() => void> = [];
    await loadPlugin(files, null, layoutCallbacks);

    layoutCallbacks.forEach((callback) => callback());

    expect(files.get("PomoVault.md")).toContain("```pomoblock");
    expect(open).toHaveBeenCalledOnce();
    open.mockRestore();
  });
});

async function loadPlugin(
  files: Map<string, string>,
  stored: Partial<PomoVaultSettings> | null,
  layoutCallbacks: Array<() => void> = [],
): Promise<{ plugin: TestablePomoVaultPlugin; processor: (source: string, root: HTMLElement) => Promise<void> }> {
  const plugin = new (PomoVaultPlugin as never as { new(): TestablePomoVaultPlugin })();
  let processor: ((source: string, root: HTMLElement) => Promise<void>) | undefined;

  plugin.app = createApp(files, layoutCallbacks);
  plugin.loadData = async () => stored;
  plugin.saveData = vi.fn();
  plugin.registerMarkdownCodeBlockProcessor = vi.fn((_language, callback) => {
    processor = callback;
  });
  plugin.registerInterval = vi.fn();
  plugin.addCommand = vi.fn();
  plugin.addSettingTab = vi.fn();

  await plugin.onload();

  if (!processor) throw new Error("pomoblock processor was not registered");
  return { plugin, processor };
}

function createApp(files: Map<string, string>, layoutCallbacks: Array<() => void>) {
  return {
    vault: {
      getAbstractFileByPath(path: string) {
        return files.has(path) ? createFile(path) : null;
      },
      async read(file: TFile) {
        return files.get(file.path) ?? "";
      },
      async create(path: string, source: string) {
        files.set(path, source);
        return createFile(path);
      },
      async modify(file: TFile, source: string) {
        files.set(file.path, source);
      },
    },
    workspace: {
      onLayoutReady(callback: () => void) {
        layoutCallbacks.push(callback);
      },
      openLinkText: vi.fn(),
      getLeaf() {
        return {
          openFile: vi.fn(),
        };
      },
    },
  };
}

function createFile(path: string): TFile {
  return new (TFile as never as { new(path: string): TFile })(path);
}

type TestablePomoVaultPlugin = {
  app: ReturnType<typeof createApp>;
  timer: {
    state: {
      running: boolean;
      remainingSeconds: number;
      activeTaskId: string | null;
      activeTaskText: string | null;
      sessionStartedAt: number | null;
      lastTickAt: number | null;
    };
  };
  onload(): Promise<void>;
  tickTimer(): Promise<void>;
  loadData(): Promise<unknown>;
  saveData(data?: unknown): Promise<void>;
  registerMarkdownCodeBlockProcessor(
    language: string,
    callback: (source: string, root: HTMLElement) => Promise<void>,
  ): void;
  registerInterval(id: number): void;
  addCommand(command: unknown): void;
  addSettingTab(tab: unknown): void;
};
