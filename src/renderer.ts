import type { ParsedTask, TimerState } from "./types";

export interface RendererSettings {
  showPriorityBadges: boolean;
  showDates: boolean;
  showRecurringIndicator: boolean;
  nowWorkingHeading: "H1" | "H2" | "H3";
  nowWorkingCallout: "warning" | "info" | "tip" | "danger" | "success";
}

export interface RenderState {
  timer: TimerState;
  tasks: ParsedTask[];
  today: string;
  settings: RendererSettings;
}

export interface RendererActions {
  onStartTask(taskId: string): void;
  onCompleteTask(taskId: string): void;
  onAddTask(): void;
  onPause(): void;
  onReset(): void;
  onOpenLink(linkText: string): void;
}

export class PomoVaultRenderer {
  constructor(private readonly actions: RendererActions) {}

  render(root: HTMLElement, state: RenderState): void {
    root.replaceChildren();
    root.classList.add("pomovault");

    root.append(
      this.renderTimer(state.timer),
      this.renderNowWorking(state),
      this.renderTaskList(state),
    );
  }

  private renderTimer(timer: TimerState): HTMLElement {
    const section = document.createElement("section");
    section.className = "pomovault__panel pomovault__timer-panel";

    const label = document.createElement("div");
    label.className = "pomovault__mode";
    label.textContent = `${formatMode(timer.mode)} · Session ${timer.completedWorkSessions + 1}/4`;

    const display = document.createElement("div");
    display.className = "pomovault__timer";
    display.textContent = formatSeconds(timer.remainingSeconds);
    if (timer.remainingSeconds <= 60) display.classList.add("pomovault__timer--danger");

    const controls = document.createElement("div");
    controls.className = "pomovault__controls";
    controls.append(
      button("Pause", "pause", () => this.actions.onPause()),
      button("Reset", "reset", () => this.actions.onReset()),
    );

    section.append(label, display, controls);
    return section;
  }

  private renderNowWorking(state: RenderState): HTMLElement {
    const section = document.createElement("section");
    section.className = `pomovault__panel pomovault__now pomovault__now--${state.settings.nowWorkingCallout}`;

    const heading = document.createElement(state.settings.nowWorkingHeading.toLowerCase());
    heading.textContent = "NOW WORKING ON";

    const content = document.createElement("p");
    content.textContent = state.timer.activeTaskText ?? "No active task. Start one from the list.";

    section.append(heading, content);
    return section;
  }

  private renderTaskList(state: RenderState): HTMLElement {
    const section = document.createElement("section");
    section.className = "pomovault__panel";

    const header = document.createElement("div");
    header.className = "pomovault__task-header";
    const title = document.createElement("h3");
    title.textContent = "Tasks";
    header.append(title, button("+ Add Task", "add-task", () => this.actions.onAddTask()));

    const list = document.createElement("div");
    list.className = "pomovault__tasks";
    for (const task of state.tasks) {
      list.append(this.renderTask(task, state));
    }

    if (state.tasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "pomovault__empty";
      empty.textContent = "No actionable tasks found.";
      list.append(empty);
    }

    section.append(header, list);
    return section;
  }

  private renderTask(task: ParsedTask, state: RenderState): HTMLElement {
    const row = document.createElement("article");
    row.className = "pomovault__task";

    row.append(button("▶ Start", "start-task", () => this.actions.onStartTask(task.id)));

    if (state.settings.showPriorityBadges) {
      const priority = document.createElement("span");
      priority.className = `pomovault__priority pomovault__priority--${task.priority}`;
      priority.textContent = task.priority.toUpperCase();
      row.append(priority);
    }

    const text = document.createElement("span");
    text.className = "pomovault__task-text";
    appendLinkedText(text, task.displayText, this.actions.onOpenLink);
    row.append(text);

    if (state.settings.showRecurringIndicator && task.recurring) {
      const recurring = document.createElement("span");
      recurring.className = "pomovault__recurring";
      recurring.textContent = "↺";
      row.append(recurring);
    }

    if (state.settings.showDates && task.dueDate) {
      const due = document.createElement("span");
      due.className = task.dueDate <= state.today ? "pomovault__date pomovault__date--due" : "pomovault__date";
      due.textContent = task.dueDate;
      row.append(due);
    }

    row.append(button("✓ Done", "complete-task", () => this.actions.onCompleteTask(task.id)));
    return row;
  }
}

function button(label: string, action: string, onClick: () => void): HTMLButtonElement {
  const item = document.createElement("button");
  item.type = "button";
  item.dataset.action = action;
  item.textContent = label;
  item.addEventListener("click", onClick);
  return item;
}

function appendLinkedText(root: HTMLElement, text: string, onOpenLink: (linkText: string) => void): void {
  const linkPattern = /\[\[([^\]]+)]]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      root.append(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const linkText = match[1];
    const link = document.createElement("button");
    link.type = "button";
    link.className = "pomovault__wikilink";
    link.textContent = `[[${linkText}]]`;
    link.addEventListener("click", () => onOpenLink(linkText));
    root.append(link);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    root.append(document.createTextNode(text.slice(lastIndex)));
  }
}

function formatSeconds(value: number): string {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatMode(mode: TimerState["mode"]): string {
  if (mode === "short-break") return "Short Break";
  if (mode === "long-break") return "Long Break";
  return "Work";
}
