// INI風セクション形式パーサー

import type { ParsedRecord } from "../types.js";

/**
 * INI形式をParsedRecordに変換する。
 * [section] をレコードの識別名として使用し、key=value を属性として扱う。
 * セクション名は "商品名" ヘッダーとして追加する。
 */
export function parseIni(text: string): ParsedRecord {
  const lines = text.trim().split("\n");
  const items: Record<string, string>[] = [];
  let currentSection: string | null = null;
  let current: Record<string, string> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;

    // [section] パターン
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      if (currentSection !== null) {
        items.push({ "商品名": currentSection, ...current });
      }
      currentSection = sectionMatch[1];
      current = {};
      continue;
    }

    // key=value パターン
    const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
    if (kvMatch) {
      current[kvMatch[1].trim()] = kvMatch[2].trim();
    }
  }

  if (currentSection !== null) {
    items.push({ "商品名": currentSection, ...current });
  }

  if (items.length === 0) {
    return { headers: null, rows: [] };
  }

  const headers = Object.keys(items[0]);
  return { headers, rows: items };
}
