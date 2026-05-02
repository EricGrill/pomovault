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
