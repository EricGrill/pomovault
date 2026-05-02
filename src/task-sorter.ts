import type { ParsedTask, Priority } from "./types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 0,
  highest: 1,
  high: 2,
  normal: 3,
  low: 4,
  lowest: 5,
};

export function getVisibleSortedTasks(tasks: ParsedTask[], today: string): ParsedTask[] {
  return tasks
    .filter((task) => task.status !== "done")
    .filter((task) => !task.startDate || task.startDate <= today)
    .sort((a, b) => {
      const groupDiff = dueGroup(a, today) - dueGroup(b, today);
      if (groupDiff !== 0) return groupDiff;

      if (dueGroup(a, today) === 1) {
        const dueDiff = (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
        if (dueDiff !== 0) return dueDiff;
      }

      const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return a.lineNumber - b.lineNumber;
    });
}

function dueGroup(task: ParsedTask, today: string): number {
  if (task.dueDate && task.dueDate <= today) return 0;
  if (task.dueDate) return 1;
  return 2;
}
