import type { LedgerEntry, SessionMode } from "./types";

export function formatLedgerEntry(entry: LedgerEntry): string {
  const base = `- ${entry.startTime}-${entry.endTime} | ${formatMode(entry.mode)} | ${entry.durationMinutes}m | ${entry.outcome}`;
  return entry.taskText ? `${base} | ${entry.taskText}` : base;
}

export function appendLedgerEntry(source: string, entry: LedgerEntry): string {
  const normalized = source.replace(/\s+$/g, "");
  const line = formatLedgerEntry(entry);
  const heading = `## ${entry.date}`;

  if (normalized.length === 0) {
    return `${heading}\n\n${line}\n`;
  }

  const lines = normalized.split("\n");
  const headingIndex = lines.findIndex((item) => item.trim() === heading);
  if (headingIndex === -1) {
    return `${normalized}\n\n${heading}\n\n${line}\n`;
  }

  let insertAt = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+\d{4}-\d{2}-\d{2}/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }

  const next = [...lines.slice(0, insertAt), line, ...lines.slice(insertAt)];
  return `${next.join("\n")}\n`;
}

function formatMode(mode: SessionMode): string {
  if (mode === "short-break") return "Short Break";
  if (mode === "long-break") return "Long Break";
  return "Work";
}
