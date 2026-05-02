import { describe, expect, it } from "vitest";
import { createInitialTimerState, PomoTimer } from "../src/timer";

const durations = {
  workSeconds: 25 * 60,
  shortBreakSeconds: 5 * 60,
  longBreakSeconds: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

describe("PomoTimer", () => {
  it("starts a work session with an active task", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));

    timer.start(1000, "task-1", "Draft proposal");

    expect(timer.state.running).toBe(true);
    expect(timer.state.mode).toBe("work");
    expect(timer.state.activeTaskId).toBe("task-1");
    expect(timer.state.activeTaskText).toBe("Draft proposal");
  });

  it("ticks down using elapsed time and pauses safely", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));
    timer.start(1000, "task-1", "Draft proposal");
    timer.tick(61_000);
    timer.pause(61_000);

    expect(timer.state.running).toBe(false);
    expect(timer.state.remainingSeconds).toBe(1440);
  });

  it("advances to short break after a completed work session", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));
    timer.start(0, "task-1", "Draft proposal");
    const event = timer.tick(25 * 60 * 1000);

    expect(event?.completedMode).toBe("work");
    expect(timer.state.mode).toBe("short-break");
    expect(timer.state.remainingSeconds).toBe(5 * 60);
    expect(timer.state.completedWorkSessions).toBe(1);
  });

  it("clears active task state when advancing into a break", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));
    timer.start(0, "task-1", "Draft proposal");
    timer.tick(25 * 60 * 1000);

    expect(timer.state.activeTaskId).toBeNull();
    expect(timer.state.activeTaskText).toBeNull();
  });

  it("uses long break after the configured number of work sessions", () => {
    const timer = new PomoTimer({
      ...durations,
      workSeconds: 1,
      shortBreakSeconds: 1,
    }, createInitialTimerState({
      ...durations,
      workSeconds: 1,
      shortBreakSeconds: 1,
    }));

    for (let i = 0; i < 7; i += 1) {
      timer.start(i * 1000, null, null);
      timer.tick((i + 1) * 1000);
    }

    expect(timer.state.completedWorkSessions).toBe(4);
    expect(timer.state.mode).toBe("long-break");
  });

  it("can start the current break without attaching a task", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));
    timer.start(0, "task-1", "Draft proposal");
    timer.tick(25 * 60 * 1000);

    timer.start((25 * 60 * 1000) + 1000, null, null);

    expect(timer.state.running).toBe(true);
    expect(timer.state.mode).toBe("short-break");
    expect(timer.state.activeTaskId).toBeNull();
    expect(timer.state.activeTaskText).toBeNull();
  });

  it("reconfigures idle durations without rebuilding the plugin", () => {
    const timer = new PomoTimer(durations, createInitialTimerState(durations));

    timer.configure({
      workSeconds: 10 * 60,
      shortBreakSeconds: 2 * 60,
      longBreakSeconds: 8 * 60,
      sessionsBeforeLongBreak: 3,
    });

    expect(timer.state.remainingSeconds).toBe(10 * 60);
  });
});
