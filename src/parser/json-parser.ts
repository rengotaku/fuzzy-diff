// JSON/Array パーサー

import type { ParsedRecord } from "../types.js";

/**
 * JSON文字列をParsedRecordに変換する。
 * - オブジェクト配列 → headers = keys, rows = objects
 * - 二次元配列 → headers = null, rows = { "0": val, "1": val, ... }
 */
export function parseJson(text: string): ParsedRecord {
  const parsed = JSON.parse(text.trim());

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { headers: null, rows: [] };
  }

  // 二次元配列
  if (Array.isArray(parsed[0])) {
    const rows = parsed.map((row: unknown[]) => {
      const record: Record<string, string> = {};
      for (let i = 0; i < row.length; i++) {
        record[String(i)] = String(row[i]);
      }
      return record;
    });
    return { headers: null, rows };
  }

  // オブジェクト配列
  if (typeof parsed[0] === "object" && parsed[0] !== null) {
    const headers = Object.keys(parsed[0]);
    const rows = parsed.map((item: Record<string, unknown>) => {
      const record: Record<string, string> = {};
      for (const key of headers) {
        record[key] = String(item[key] ?? "");
      }
      return record;
    });
    return { headers, rows };
  }

  return { headers: null, rows: [] };
}
