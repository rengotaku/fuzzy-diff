// CSV/TSV パーサー

import type { ParsedRecord } from "../types.js";

/**
 * CSV/TSV文字列をParsedRecordに変換する。
 * 1行目をヘッダーとして扱い、残りの行をレコードとして返す。
 */
export function parseCsv(text: string, delimiter: string): ParsedRecord {
  const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return { headers: null, rows: [] };
  }

  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim());
    const record: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      record[headers[i]] = values[i] ?? "";
    }
    return record;
  });

  return { headers, rows };
}
