// フォーマット自動検出

import type { DetectedFormat } from "../types.js";

/**
 * テキストのフォーマットを自動検出する。
 * 検出優先度: JSON/Array > TSV > CSV > YAML > INI > plain
 */
export function detectFormat(text: string): DetectedFormat {
  const trimmed = text.trim();

  // JSON or Array
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && Array.isArray(parsed[0])) {
          return { type: "array", confidence: 0.95 };
        }
        if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
          return { type: "json", confidence: 0.95 };
        }
      }
      return { type: "json", confidence: 0.9 };
    } catch {
      // Not valid JSON, continue
    }
  }

  const lines = trimmed.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { type: "plain", confidence: 0.5 };
  }

  // INI: check for [section] pattern
  if (/^\[.+\]$/.test(lines[0].trim())) {
    const hasKeyValue = lines.some((l) => /^[^[\]]+=[^=]/.test(l.trim()));
    if (hasKeyValue) {
      return { type: "ini", confidence: 0.9 };
    }
  }

  // YAML: check for "- key: value" or "key: value" pattern
  const yamlLineCount = lines.filter((l) =>
    /^\s*-?\s*\S+:\s+\S/.test(l),
  ).length;
  if (yamlLineCount >= lines.length * 0.6) {
    return { type: "yaml", confidence: 0.85 };
  }

  // TSV: consistent tab counts across lines
  const tabCounts = lines.map((l) => (l.match(/\t/g) ?? []).length);
  if (tabCounts[0] > 0 && tabCounts.every((c) => c === tabCounts[0])) {
    return { type: "tsv", confidence: 0.9 };
  }

  // CSV: consistent comma counts across lines
  const commaCounts = lines.map((l) => (l.match(/,/g) ?? []).length);
  if (commaCounts[0] > 0 && commaCounts.every((c) => c === commaCounts[0])) {
    return { type: "csv", confidence: 0.85 };
  }

  return { type: "plain", confidence: 0.5 };
}
