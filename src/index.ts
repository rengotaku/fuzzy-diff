// 公開APIエントリポイント

export { compare, compareText, compareStructured, calculateScore, isMatch } from "./comparator/index.js";
export { normalize } from "./normalizer/index.js";
export { detectFormat, parse } from "./parser/index.js";
export type {
  ComparisonInput,
  NormalizedText,
  DetectedFormat,
  FormatType,
  ParsedRecord,
  DiffItem,
  ComparisonResult,
  CompareOptions,
} from "./types.js";
