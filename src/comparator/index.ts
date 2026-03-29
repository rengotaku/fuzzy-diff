// T006: 比較モジュールのエントリポイント（スタブ）

import type { CompareOptions, ComparisonResult } from "../types.js";

export function compare(
  source: string,
  target: string,
  _options?: CompareOptions,
): ComparisonResult {
  return {
    score: 0,
    match: false,
    diffs: [],
    sourceFormat: { type: "plain", confidence: 1.0 },
    targetFormat: { type: "plain", confidence: 1.0 },
  };
}
