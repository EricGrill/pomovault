import { formatTaskLine } from "./task-parser";
import type { AddTaskInput } from "./types";

export function completeTaskInSource(
  source: string,
  taskId: string,
  completionDate: string,
  expectedOriginalLine?: string,
): string {
  const lineNumber = parseLineNumber(taskId);
  const lines = source.split(/\r?\n/);
  const line = lines[lineNumber];

  if (line === undefined || !/^\s*- \[[ /]\]/.test(line)) {
    throw new Error(`Task line not found for ${taskId}`);
  }

  if (expectedOriginalLine !== undefined && line !== expectedOriginalLine) {
    throw new Error("Task source changed; reload before completing.");
  }

  const completed = line
    .replace(/^(\s*- )\[[ /]\]/, "$1[x]")
    .replace(/\s+$/g, "");

  lines[lineNumber] = /✅\s*\d{4}-\d{2}-\d{2}/u.test(completed)
    ? completed
    : `${completed} ✅ ${completionDate}`;

  return lines.join("\n");
}

export function addTaskToSource(source: string, input: AddTaskInput): string {
  const trimmedEnd = source.replace(/\s+$/g, "");
  const prefix = trimmedEnd.length === 0 ? "" : `${trimmedEnd}\n`;
  return `${prefix}${formatTaskLine(input)}`;
}

function parseLineNumber(taskId: string): number {
  const raw = taskId.split(":").at(-1);
  const lineNumber = Number(raw);
  if (!Number.isInteger(lineNumber) || lineNumber < 0) {
    throw new Error(`Invalid task id ${taskId}`);
  }
  return lineNumber;
}
