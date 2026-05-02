import type { App } from "obsidian";
import { TFile } from "obsidian";
import { EXECUTION_NOTE, TASK_BLOCK_LANGUAGE } from "./constants";
import { validateMarkdownPath } from "./path-policy";

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
  const normalized = validateMarkdownPath(path || EXECUTION_NOTE, { label: "Markdown path" });
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof TFile) {
    return existing;
  }
  return app.vault.create(normalized, content);
}

export async function readFile(app: App, path: string): Promise<string> {
  const normalized = validateMarkdownPath(path, { label: "Markdown path" });
  const file = app.vault.getAbstractFileByPath(normalized);
  if (!(file instanceof TFile)) {
    throw new Error(`File not found: ${path}`);
  }
  return app.vault.read(file);
}

export async function readFileIfExists(app: App, path: string): Promise<string | null> {
  const normalized = validateMarkdownPath(path, { label: "Markdown path" });
  const file = app.vault.getAbstractFileByPath(normalized);
  if (file == null) return null;
  if (!(file instanceof TFile)) {
    throw new Error(`Path is not a markdown file: ${path}`);
  }
  return app.vault.read(file);
}

export async function overwriteFile(
  app: App,
  path: string,
  source: string,
  options: { createIfMissing?: boolean } = {},
): Promise<void> {
  const normalized = validateMarkdownPath(path, { label: "Markdown path" });
  const file = app.vault.getAbstractFileByPath(normalized);
  if (!(file instanceof TFile)) {
    if (options.createIfMissing === false) {
      throw new Error(`File not found: ${path}`);
    }
    await app.vault.create(normalized, source);
    return;
  }
  await app.vault.modify(file, source);
}
