// JSON/Array パーサー

import type { ParsedRecord } from "../types.js";

/**
 * JSON文字列をParsedRecordに変換する。
 * - オブジェクト配列 → headers = keys, rows = objects
 * - 二次元配列（先頭行が全て文字列） → headers = 先頭行, rows = 残りをキー付きで対応
 * - 二次元配列（上記以外） → headers = null, rows = { "0": val, "1": val, ... }
 */
export function parseJson(text: string): ParsedRecord {
  const parsed = JSON.parse(text.trim());

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { headers: null, rows: [] };
  }

  // 二次元配列
  if (Array.isArray(parsed[0])) {
    const firstRow = parsed[0] as unknown[];
    const firstRowAllStrings =
      firstRow.length > 0 && firstRow.every((v) => typeof v === "string");

    // 先頭行がすべて文字列 → ヘッダー行として扱う（CSV/TSVと同じ慣習）
    if (firstRowAllStrings && parsed.length >= 2) {
      const headers = firstRow as string[];
      const rows = parsed.slice(1).map((row: unknown[]) => {
        const record: Record<string, string> = {};
        for (let i = 0; i < headers.length; i++) {
          record[headers[i]!] = String(row[i] ?? "");
        }
        return record;
      });
      return { headers, rows };
    }

    // それ以外は純粋な二次元配列として数値キーでパース
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
