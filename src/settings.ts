import type { App, Plugin } from "obsidian";
import { PluginSettingTab, Setting } from "obsidian";
import { EXECUTION_NOTE, LOG_NOTE } from "./constants";
import { normalizeMarkdownPathSetting } from "./path-policy";
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
    executionNotePath: normalizeMarkdownPathSetting(merged.executionNotePath, {
      fallback: DEFAULT_SETTINGS.executionNotePath,
      label: "Execution note path",
    }),
    taskSourcePath: normalizeMarkdownPathSetting(merged.taskSourcePath, {
      allowEmpty: true,
      label: "Task source path",
    }),
    logPath: normalizeMarkdownPathSetting(merged.logPath, {
      fallback: DEFAULT_SETTINGS.logPath,
      label: "Log path",
    }),
    workMinutes: positiveInteger(merged.workMinutes, DEFAULT_SETTINGS.workMinutes),
    shortBreakMinutes: positiveInteger(merged.shortBreakMinutes, DEFAULT_SETTINGS.shortBreakMinutes),
    longBreakMinutes: positiveInteger(merged.longBreakMinutes, DEFAULT_SETTINGS.longBreakMinutes),
    sessionsBeforeLongBreak: positiveInteger(merged.sessionsBeforeLongBreak, DEFAULT_SETTINGS.sessionsBeforeLongBreak),
    volume: clamp(merged.volume, 0, 100),
  };
}

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

  private numberSetting(
    name: string,
    placeholder: string,
    key: "workMinutes" | "shortBreakMinutes" | "longBreakMinutes" | "sessionsBeforeLongBreak",
  ): void {
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

  private toggleSetting(
    name: string,
    key: "autoAdvance" | "soundOnCompletion" | "logBreaks" | "showPriorityBadges" | "showDates" | "showRecurringIndicator",
  ): void {
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

function positiveInteger(value: number, fallback: number): number {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.volume;
  return Math.min(max, Math.max(min, Math.round(value)));
}
