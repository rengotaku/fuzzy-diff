// T005: パーサーモジュールのエントリポイント（スタブ）

import type { DetectedFormat, FormatType, ParsedRecord } from "../types.js";

export function detectFormat(text: string): DetectedFormat {
  return { type: "plain", confidence: 1.0 };
}

export function parse(text: string, _format?: FormatType): ParsedRecord {
  return { headers: null, rows: [] };
}
