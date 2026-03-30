// 比較パイプライン: 正規化 → テキスト比較 → スコアリング

import type { CompareOptions, ComparisonResult, DiffItem } from "../types.js";
import { normalize } from "../normalizer/index.js";
import { compareText } from "./text.js";
import { calculateScore, isMatch } from "./scorer.js";

export { compareText } from "./text.js";
export { calculateScore, isMatch } from "./scorer.js";

/**
 * 2つのテキストを比較し、類似度スコアとmatch/mismatch判定を返す。
 *
 * パイプライン:
 * 1. 正規化（オプションで無効化可能）
 * 2. fuzzball によるテキスト fuzzy 比較
 * 3. スコアリング + match 判定
 */
export function compare(
  source: string,
  target: string,
  options?: CompareOptions,
): ComparisonResult {
  const shouldNormalize = options?.normalize ?? true;

  const normalizedSource = shouldNormalize
    ? normalize(source).normalized
    : source;
  const normalizedTarget = shouldNormalize
    ? normalize(target).normalized
    : target;

  const fuzzScore = compareText(normalizedSource, normalizedTarget);
  const score = calculateScore(fuzzScore);
  const matched = isMatch(score, options?.threshold);

  const diffs: readonly DiffItem[] =
    score >= 1.0 ? [] : buildDiffs(normalizedSource, normalizedTarget);

  return {
    score,
    match: matched,
    diffs,
    sourceFormat: { type: "plain", confidence: 1.0 },
    targetFormat: { type: "plain", confidence: 1.0 },
  };
}

/**
 * 正規化後のテキスト間の差分を生成する。
 * Phase 3 では行ベースの簡易差分のみ。
 */
function buildDiffs(source: string, target: string): readonly DiffItem[] {
  const sourceLines = new Set(
    source.split("\n").map((l) => l.trim()).filter(Boolean),
  );
  const targetLines = new Set(
    target.split("\n").map((l) => l.trim()).filter(Boolean),
  );

  const diffs: DiffItem[] = [];

  for (const line of sourceLines) {
    if (!targetLines.has(line)) {
      diffs.push({
        type: "removed",
        path: "",
        sourceValue: line,
        targetValue: null,
      });
    }
  }

  for (const line of targetLines) {
    if (!sourceLines.has(line)) {
      diffs.push({
        type: "added",
        path: "",
        sourceValue: null,
        targetValue: line,
      });
    }
  }

  return diffs;
}
