import { normalizePath } from "obsidian";

export interface MarkdownPathOptions {
  allowEmpty?: boolean;
  fallback?: string;
  label?: string;
}

export function validateMarkdownPath(rawPath: string, options: MarkdownPathOptions = {}): string {
  const label = options.label ?? "Path";
  const trimmed = rawPath.trim();

  if (trimmed.length === 0) {
    if (options.allowEmpty) return "";
    if (options.fallback) return validateMarkdownPath(options.fallback, { label });
    throw new Error(`${label} is required.`);
  }

  const rawSegments = trimmed.replace(/\\/g, "/").split("/").filter(Boolean);
  if (trimmed.startsWith("/") || rawSegments.includes("..")) {
    throw new Error(`${label} must stay inside the vault.`);
  }

  const normalized = normalizePath(trimmed);
  const segments = normalized.split("/").filter(Boolean);

  if (normalized.startsWith("/") || segments.includes("..")) {
    throw new Error(`${label} must stay inside the vault.`);
  }

  if (segments.some((segment) => segment === "." || segment.startsWith("."))) {
    throw new Error(`${label} cannot target hidden vault paths.`);
  }

  if (!normalized.toLowerCase().endsWith(".md")) {
    throw new Error(`${label} must be a markdown file.`);
  }

  return normalized;
}

export function normalizeMarkdownPathSetting(rawPath: string, options: MarkdownPathOptions = {}): string {
  try {
    return validateMarkdownPath(rawPath, options);
  } catch {
    if (options.allowEmpty) return "";
    if (options.fallback) return validateMarkdownPath(options.fallback, { label: options.label });
    throw new Error(`${options.label ?? "Path"} is invalid.`);
  }
}
