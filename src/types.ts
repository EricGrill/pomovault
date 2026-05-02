export type Priority = "urgent" | "highest" | "high" | "normal" | "low" | "lowest";
export type TaskStatus = "todo" | "done" | "in-progress";
export type SessionMode = "work" | "short-break" | "long-break";
export type SessionOutcome = "Completed" | "Reset" | "Skipped";

export interface PomoVaultSettings {
  executionNotePath: string;
  taskSourcePath: string;
  logPath: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  autoAdvance: boolean;
  soundOnCompletion: boolean;
  soundName: "chime";
  volume: number;
  nowWorkingCallout: "warning" | "info" | "tip" | "danger" | "success";
  nowWorkingHeading: "H1" | "H2" | "H3";
  showPriorityBadges: boolean;
  showDates: boolean;
  showRecurringIndicator: boolean;
  logBreaks: boolean;
}

export interface ParsedTask {
  id: string;
  filePath: string;
  lineNumber: number;
  originalLine: string;
  indentation: string;
  status: TaskStatus;
  text: string;
  displayText: string;
  priority: Priority;
  dueDate: string | null;
  startDate: string | null;
  recurring: string | null;
  completedDate: string | null;
}

export interface AddTaskInput {
  text: string;
  priority: Priority;
  dueDate: string | null;
  startDate: string | null;
  recurring: string | null;
}

export interface TimerDurations {
  workSeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  sessionsBeforeLongBreak: number;
}

export interface TimerState {
  mode: SessionMode;
  running: boolean;
  remainingSeconds: number;
  completedWorkSessions: number;
  activeTaskId: string | null;
  activeTaskText: string | null;
  sessionStartedAt: number | null;
  lastTickAt: number | null;
}

export interface LedgerEntry {
  date: string;
  startTime: string;
  endTime: string;
  mode: SessionMode;
  durationMinutes: number;
  outcome: SessionOutcome;
  taskText: string | null;
}
