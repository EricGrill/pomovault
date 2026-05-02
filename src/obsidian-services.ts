import type { App } from "obsidian";
import { normalizePath, TFile } from "obsidian";
import { EXECUTION_NOTE, TASK_BLOCK_LANGUAGE } from "./constants";

export function createExecutionNoteContent(): string {
  return [
    "# PomoVault",
    "",
    "```" + TASK_BLOCK_LANGUAGE,
    "```",
    "",
  ].join("\n");
}

export function todayLocalDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function ensureMarkdownFile(app: App, path: string, content: string): Promise<TFile> {
  const normalized = normalizePath(path || EXECUTION_NOTE);
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof TFile) {
    return existing;
  }
  return app.vault.create(normalized, content);
}

export async function readFile(app: App, path: string): Promise<string> {
  const file = app.vault.getAbstractFileByPath(normalizePath(path));
  if (!(file instanceof TFile)) {
    throw new Error(`File not found: ${path}`);
  }
  return app.vault.read(file);
}

export async function overwriteFile(app: App, path: string, source: string): Promise<void> {
  const normalized = normalizePath(path);
  const file = app.vault.getAbstractFileByPath(normalized);
  if (!(file instanceof TFile)) {
    await app.vault.create(normalized, source);
    return;
  }
  await app.vault.modify(file, source);
}
