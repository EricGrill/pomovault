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
