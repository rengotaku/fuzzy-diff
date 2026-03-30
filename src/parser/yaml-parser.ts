// YAML風リストパーサー（簡易実装: "- key: value" 形式のみ対応）

import type { ParsedRecord } from "../types.js";

/**
 * YAML風リスト形式をParsedRecordに変換する。
 * "- key: value" を項目の開始とし、"  key: value" を同じ項目の属性として扱う。
 */
export function parseYaml(text: string): ParsedRecord {
  const lines = text.trim().split("\n");
  const items: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;

    // "- key: value" パターン（新しい項目の開始）
    const dashMatch = trimmed.match(/^-\s+(\S+?):\s+(.+)$/);
    if (dashMatch) {
      if (current !== null) {
        items.push(current);
      }
      current = { [dashMatch[1]]: dashMatch[2] };
      continue;
    }

    // "key: value" パターン（現在の項目の属性）
    const kvMatch = trimmed.match(/^(\S+?):\s+(.+)$/);
    if (kvMatch && current !== null) {
      current[kvMatch[1]] = kvMatch[2];
    }
  }

  if (current !== null) {
    items.push(current);
  }

  if (items.length === 0) {
    return { headers: null, rows: [] };
  }

  const headers = Object.keys(items[0]);
  return { headers, rows: items };
}
