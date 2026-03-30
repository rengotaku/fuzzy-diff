// パーサーモジュール: フォーマット検出 + パーサー統合

import type { DetectedFormat, FormatType, ParsedRecord } from "../types.js";
import { detectFormat as detect } from "./detector.js";
import { parseJson } from "./json-parser.js";
import { parseCsv } from "./csv-parser.js";
import { parseYaml } from "./yaml-parser.js";
import { parseIni } from "./ini-parser.js";

export { detectFormat } from "./detector.js";
export { parseJson } from "./json-parser.js";
export { parseCsv } from "./csv-parser.js";
export { parseYaml } from "./yaml-parser.js";
export { parseIni } from "./ini-parser.js";

/**
 * テキストをパースして構造化中間表現に変換する。
 * format未指定の場合は自動検出する。
 */
export function parse(text: string, format?: FormatType): ParsedRecord {
  const detected = format
    ? { type: format, confidence: 1.0 } satisfies DetectedFormat
    : detect(text);

  switch (detected.type) {
    case "json":
    case "array":
      return parseJson(text);
    case "tsv":
      return parseCsv(text, "\t");
    case "csv":
      return parseCsv(text, ",");
    case "yaml":
      return parseYaml(text);
    case "ini":
      return parseIni(text);
    case "plain":
      return { headers: null, rows: [] };
  }
}
