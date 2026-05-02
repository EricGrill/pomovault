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

  it("throws when the selected source line changed after render", () => {
    const source = "- [ ] First\n- [ ] Second";

    expect(() => completeTaskInSource(source, "Tasks.md:1", "2026-05-02", "- [ ] Original second"))
      .toThrow("Task source changed; reload before completing.");
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
