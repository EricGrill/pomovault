import type { AddTaskInput, ParsedTask, Priority, TaskStatus } from "./types";

const TASK_RE = /^(\s*)- \[([ x/])\]\s+(.+)$/;
const DATE_RE = /(?:^|\s)📅\s*(\d{4}-\d{2}-\d{2})/u;
const START_RE = /(?:^|\s)🛫\s*(\d{4}-\d{2}-\d{2})/u;
const DONE_RE = /(?:^|\s)✅\s*(\d{4}-\d{2}-\d{2})/u;
const RECUR_RE = /(?:^|\s)🔁\s*([^📅🛫✅⏫🔺🔼🔽⏬]+)/u;

const PRIORITY_BY_EMOJI: Array<[string, Priority]> = [
  ["🔺", "urgent"],
  ["⏫", "highest"],
  ["🔼", "high"],
  ["🔽", "low"],
  ["⏬", "lowest"],
];

const EMOJI_BY_PRIORITY: Record<Priority, string> = {
  urgent: "🔺",
  highest: "⏫",
  high: "🔼",
  normal: "",
  low: "🔽",
  lowest: "⏬",
};

export function parseTasks(source: string, filePath: string): ParsedTask[] {
  return source.split(/\r?\n/).flatMap((line, lineNumber) => {
    const match = TASK_RE.exec(line);
    if (!match) return [];

    const [, indentation, marker, body] = match;
    const text = stripMetadata(body).trim();

    return [{
      id: `${filePath}:${lineNumber}`,
      filePath,
      lineNumber,
      originalLine: line,
      indentation,
      status: parseStatus(marker),
      text,
      displayText: text,
      priority: parsePriority(body),
      dueDate: matchDate(DATE_RE, body),
      startDate: matchDate(START_RE, body),
      recurring: matchRecurring(body),
      completedDate: matchDate(DONE_RE, body),
    }];
  });
}

export function formatTaskLine(input: AddTaskInput): string {
  const parts = [`- [ ] ${input.text.trim()}`];
  if (input.dueDate) parts.push(`📅 ${input.dueDate}`);
  if (input.startDate) parts.push(`🛫 ${input.startDate}`);
  if (input.recurring) parts.push(`🔁 ${input.recurring.trim()}`);
  const priorityEmoji = EMOJI_BY_PRIORITY[input.priority];
  if (priorityEmoji) parts.push(priorityEmoji);
  return parts.join(" ");
}

export function stripMetadata(body: string): string {
  return body
    .replace(DATE_RE, "")
    .replace(START_RE, "")
    .replace(DONE_RE, "")
    .replace(RECUR_RE, "")
    .replace(/[⏫🔺🔼🔽⏬]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseStatus(marker: string): TaskStatus {
  if (marker === "x") return "done";
  if (marker === "/") return "in-progress";
  return "todo";
}

function parsePriority(body: string): Priority {
  return PRIORITY_BY_EMOJI.find(([emoji]) => body.includes(emoji))?.[1] ?? "normal";
}

function matchDate(regex: RegExp, body: string): string | null {
  return regex.exec(body)?.[1] ?? null;
}

function matchRecurring(body: string): string | null {
  return RECUR_RE.exec(body)?.[1].trim() ?? null;
}
