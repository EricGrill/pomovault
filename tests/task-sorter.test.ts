import { describe, expect, it } from "vitest";
import { getVisibleSortedTasks } from "../src/task-sorter";
import type { ParsedTask } from "../src/types";

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
