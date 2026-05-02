// @vitest-environment jsdom
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
