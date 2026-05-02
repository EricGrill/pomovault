import { describe, expect, it } from "vitest";
import { createExecutionNoteContent, ensureMarkdownFile, overwriteFile, readFile, todayLocalDate } from "../src/obsidian-services";

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

describe("vault markdown path policy", () => {
  it("rejects hidden, traversal, and non-markdown paths before vault IO", async () => {
    const app = {
      vault: {
        getAbstractFileByPath() {
          throw new Error("vault should not be called for unsafe paths");
        },
      },
    };

    await expect(readFile(app as never, ".obsidian/plugins.json")).rejects.toThrow("hidden vault paths");
    await expect(overwriteFile(app as never, "../Tasks.md", "")).rejects.toThrow("inside the vault");
    await expect(ensureMarkdownFile(app as never, "Tasks.txt", "")).rejects.toThrow("markdown file");
  });
});
