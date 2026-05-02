import type { SessionMode, TimerDurations, TimerState } from "./types";

export interface TimerCompletionEvent {
  completedMode: SessionMode;
  startedAt: number;
  endedAt: number;
  activeTaskId: string | null;
  activeTaskText: string | null;
}

export function createInitialTimerState(durations: TimerDurations): TimerState {
  return {
    mode: "work",
    running: false,
    remainingSeconds: durations.workSeconds,
    completedWorkSessions: 0,
    activeTaskId: null,
    activeTaskText: null,
    sessionStartedAt: null,
    lastTickAt: null,
  };
}

export class PomoTimer {
  constructor(
    private durations: TimerDurations,
    public state: TimerState,
  ) {}

  start(now: number, taskId: string | null, taskText: string | null): void {
    const hasTask = taskId !== null || taskText !== null;
    const keepWorkTask = this.state.mode === "work";

    this.state = {
      ...this.state,
      running: true,
      activeTaskId: hasTask ? taskId : keepWorkTask ? this.state.activeTaskId : null,
      activeTaskText: hasTask ? taskText : keepWorkTask ? this.state.activeTaskText : null,
      sessionStartedAt: this.state.sessionStartedAt ?? now,
      lastTickAt: now,
    };
  }

  configure(durations: TimerDurations): void {
    this.durations = durations;

    if (this.state.running || this.state.sessionStartedAt !== null) return;

    this.state = {
      ...this.state,
      remainingSeconds: this.durationForMode(this.state.mode),
    };
  }

  pause(now: number): void {
    this.tick(now);
    this.state = { ...this.state, running: false, lastTickAt: null };
  }

  reset(now: number): TimerCompletionEvent | null {
    const event = this.state.sessionStartedAt === null ? null : {
      completedMode: this.state.mode,
      startedAt: this.state.sessionStartedAt,
      endedAt: now,
      activeTaskId: this.state.activeTaskId,
      activeTaskText: this.state.activeTaskText,
    };

    this.state = createInitialTimerState(this.durations);
    return event;
  }

  tick(now: number): TimerCompletionEvent | null {
    if (!this.state.running || this.state.lastTickAt === null) return null;

    const elapsedSeconds = Math.max(0, Math.floor((now - this.state.lastTickAt) / 1000));
    if (elapsedSeconds === 0) return null;

    const remainingSeconds = Math.max(0, this.state.remainingSeconds - elapsedSeconds);
    this.state = { ...this.state, remainingSeconds, lastTickAt: now };

    if (remainingSeconds > 0) return null;

    const event: TimerCompletionEvent = {
      completedMode: this.state.mode,
      startedAt: this.state.sessionStartedAt ?? now,
      endedAt: now,
      activeTaskId: this.state.activeTaskId,
      activeTaskText: this.state.activeTaskText,
    };

    this.advanceMode();
    return event;
  }

  private advanceMode(): void {
    if (this.state.mode !== "work") {
      this.state = {
        ...this.state,
        mode: "work",
        running: false,
        remainingSeconds: this.durationForMode("work"),
        activeTaskId: null,
        activeTaskText: null,
        sessionStartedAt: null,
        lastTickAt: null,
      };
      return;
    }

    const completedWorkSessions = this.state.completedWorkSessions + 1;
    const nextMode: SessionMode = completedWorkSessions % this.durations.sessionsBeforeLongBreak === 0
      ? "long-break"
      : "short-break";

    this.state = {
      ...this.state,
      mode: nextMode,
      running: false,
      remainingSeconds: this.durationForMode(nextMode),
      completedWorkSessions,
      activeTaskId: null,
      activeTaskText: null,
      sessionStartedAt: null,
      lastTickAt: null,
    };
  }

  private durationForMode(mode: SessionMode): number {
    if (mode === "short-break") return this.durations.shortBreakSeconds;
    if (mode === "long-break") return this.durations.longBreakSeconds;
    return this.durations.workSeconds;
  }
}
