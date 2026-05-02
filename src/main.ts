import { Notice, Plugin } from "obsidian";
import { TASK_BLOCK_LANGUAGE } from "./constants";
import { appendLedgerEntry } from "./log-writer";
import {
  createExecutionNoteContent,
  ensureMarkdownFile,
  overwriteFile,
  readFile,
  todayLocalDate,
} from "./obsidian-services";
import { PomoVaultRenderer } from "./renderer";
import { DEFAULT_SETTINGS, normalizeSettings, PomoVaultSettingTab } from "./settings";
import { parseTasks } from "./task-parser";
import { getVisibleSortedTasks } from "./task-sorter";
import { addTaskToSource, completeTaskInSource } from "./task-writer";
import { PomoVaultTaskModal } from "./task-modal";
import { createInitialTimerState, PomoTimer, type TimerCompletionEvent } from "./timer";
import type { AddTaskInput, LedgerEntry, PomoVaultSettings, SessionMode, TimerDurations } from "./types";

export default class PomoVaultPlugin extends Plugin {
  settings: PomoVaultSettings = DEFAULT_SETTINGS;
  private timer = new PomoTimer(this.createDurations(), createInitialTimerState(this.createDurations()));
  private renderRoots = new Set<HTMLElement>();

  async onload(): Promise<void> {
    const stored = await this.loadData();
    const firstRun = stored == null;
    this.settings = normalizeSettings(stored);
    this.timer = new PomoTimer(this.createDurations(), createInitialTimerState(this.createDurations()));

    await ensureMarkdownFile(this.app, this.settings.executionNotePath, createExecutionNoteContent());

    this.registerMarkdownCodeBlockProcessor(TASK_BLOCK_LANGUAGE, async (_source, el) => {
      await this.renderPomoBlock(el);
    });

    this.addCommand({
      id: "open-pomovault",
      name: "Open PomoVault",
      callback: () => void this.openExecutionNote(),
    });
    this.addCommand({
      id: "pause-pomovault",
      name: "Pause PomoVault timer",
      callback: () => this.pauseTimer(),
    });
    this.addCommand({
      id: "reset-pomovault",
      name: "Reset PomoVault timer",
      callback: () => void this.resetTimer(),
    });

    this.addSettingTab(new PomoVaultSettingTab(this.app, this));
    this.registerInterval(window.setInterval(() => void this.tickTimer(), 1000));

    if (firstRun) {
      this.app.workspace.onLayoutReady(() => {
        void this.openExecutionNote();
        new Notice("PomoVault is ready. Set a task source file in settings to begin.");
      });
    }
  }

  async onunload(): Promise<void> {
    await this.saveSettings();
  }

  async saveSettings(): Promise<void> {
    this.settings = normalizeSettings(this.settings);
    await this.saveData(this.settings);
  }

  private async renderPomoBlock(el: HTMLElement): Promise<void> {
    this.renderRoots.add(el);
    const tasks = await this.loadVisibleTasks();
    const renderer = new PomoVaultRenderer({
      onStartTask: (taskId) => void this.startTask(taskId),
      onCompleteTask: (taskId) => void this.completeTask(taskId),
      onAddTask: () => this.openAddTaskModal(),
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
    const roots = Array.from(this.renderRoots).filter((root) => root.isConnected);
    this.renderRoots = new Set(roots);
    await Promise.all(roots.map((root) => this.renderPomoBlock(root)));
  }

  private async loadVisibleTasks() {
    if (!this.settings.taskSourcePath) return [];
    const source = await readFile(this.app, this.settings.taskSourcePath).catch(() => "");
    if (!source) return [];
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
    if (event && this.shouldLogMode(event.completedMode)) {
      await this.appendLedgerForEvent("Reset", event);
    }
    await this.rerenderAll();
  }

  private async tickTimer(): Promise<void> {
    const event = this.timer.tick(Date.now());
    if (!event) return;

    if (this.shouldLogMode(event.completedMode)) {
      await this.appendLedgerForEvent("Completed", event);
    }
    this.playCompletionSound();

    if (this.settings.autoAdvance) {
      this.timer.start(Date.now(), null, null);
    }

    await this.rerenderAll();
  }

  private async completeTask(taskId: string): Promise<void> {
    if (!this.settings.taskSourcePath) {
      new Notice("Set a task source file in PomoVault settings first.");
      return;
    }

    const source = await readFile(this.app, this.settings.taskSourcePath);
    const updated = completeTaskInSource(source, taskId, todayLocalDate());
    await overwriteFile(this.app, this.settings.taskSourcePath, updated);
    await this.rerenderAll();
  }

  private openAddTaskModal(): void {
    if (!this.settings.taskSourcePath) {
      new Notice("Set a task source file in PomoVault settings first.");
      return;
    }

    new PomoVaultTaskModal(this.app, async (input) => this.addTask(input)).open();
  }

  private async addTask(input: AddTaskInput): Promise<void> {
    const source = await readFile(this.app, this.settings.taskSourcePath).catch(() => "");
    await overwriteFile(this.app, this.settings.taskSourcePath, addTaskToSource(source, input));
    await this.rerenderAll();
  }

  private async appendLedgerForEvent(outcome: LedgerEntry["outcome"], event: TimerCompletionEvent): Promise<void> {
    const source = await readFile(this.app, this.settings.logPath).catch(() => "");
    const entry: LedgerEntry = {
      date: todayLocalDate(new Date(event.endedAt)),
      startTime: formatTime(event.startedAt),
      endTime: formatTime(event.endedAt),
      mode: event.completedMode,
      durationMinutes: Math.max(1, Math.round((event.endedAt - event.startedAt) / 60000)),
      outcome,
      taskText: event.completedMode === "work" ? event.activeTaskText : null,
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

  private shouldLogMode(mode: SessionMode): boolean {
    return mode === "work" || this.settings.logBreaks;
  }

  private playCompletionSound(): void {
    if (!this.settings.soundOnCompletion) return;

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) {
      new Notice("PomoVault session complete.");
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    gain.gain.value = this.settings.volume / 100;
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
