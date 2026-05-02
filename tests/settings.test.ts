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
