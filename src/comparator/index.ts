// 比較パイプライン: フォーマット検出 → 正規化 → パース → 比較 → スコアリング

import type { CompareOptions, ComparisonResult, DiffItem } from "../types.js";
import { normalize } from "../normalizer/index.js";
import { detectFormat, parse } from "../parser/index.js";
import { compareText } from "./text.js";
import { compareStructured } from "./structured.js";
import { calculateScore, isMatch } from "./scorer.js";

export { compareText } from "./text.js";
export { compareStructured } from "./structured.js";
export { calculateScore, isMatch } from "./scorer.js";

/**
 * 2つのテキストを比較し、類似度スコアとmatch/mismatch判定を返す。
 *
 * パイプライン:
 * 1. フォーマット検出（元テキストで）
 * 2. 正規化（オプションで無効化可能）
 * 3. 構造化比較 or テキスト fuzzy 比較
 * 4. スコアリング + match 判定
 */
export function compare(
  source: string,
  target: string,
  options?: CompareOptions,
): ComparisonResult {
  const shouldNormalize = options?.normalize ?? true;

  // フォーマット検出は正規化前（タブ等が保持された状態）で行う
  const sourceFormat = detectFormat(source);
  const targetFormat = detectFormat(target);

  const normalizedSource = shouldNormalize
    ? normalize(source).normalized
    : source;
  const normalizedTarget = shouldNormalize
    ? normalize(target).normalized
    : target;

  // 両方が構造化フォーマットの場合: 構造化比較を試行
  if (sourceFormat.type !== "plain" && targetFormat.type !== "plain") {
    // パースは元テキストで行う（構造を保持するため）
    const sourceParsed = parse(source, sourceFormat.type);
    const targetParsed = parse(target, targetFormat.type);

    if (sourceParsed.rows.length > 0 && targetParsed.rows.length > 0) {
      const structuredResult = compareStructured(sourceParsed, targetParsed);

      // テキスト比較も行い、構造化比較と比較する
      // （フォーマット誤検出時のフォールバック）
      const textFuzzScore = compareText(normalizedSource, normalizedTarget);
      const textScore = calculateScore(textFuzzScore);

      // ヘッダー欠落の場合は構造化比較を優先
      const hasHeaderMismatch =
        (sourceParsed.headers !== null && targetParsed.headers === null) ||
        (sourceParsed.headers === null && targetParsed.headers !== null);

      if (hasHeaderMismatch) {
        return {
          score: structuredResult.score,
          match: isMatch(structuredResult.score, options?.threshold),
          diffs: structuredResult.diffs,
          sourceFormat,
          targetFormat,
        };
      }

      // 構造化比較が低スコアでもテキスト比較が高い場合はテキストを採用
      // （フォーマット誤検出のケース）
      const finalScore = Math.max(structuredResult.score, textScore);
      const finalDiffs = structuredResult.score >= textScore
        ? structuredResult.diffs
        : buildDiffs(normalizedSource, normalizedTarget);

      return {
        score: finalScore,
        match: isMatch(finalScore, options?.threshold),
        diffs: finalDiffs,
        sourceFormat,
        targetFormat,
      };
    }
  }

  // テキスト比較（多角的スコアリング）
  const fuzzScore = compareText(normalizedSource, normalizedTarget);
  const score = calculateScore(fuzzScore);
  const matched = isMatch(score, options?.threshold);

  const diffs: readonly DiffItem[] =
    score >= 1.0 ? [] : buildDiffs(normalizedSource, normalizedTarget);

  return {
    score,
    match: matched,
    diffs,
    sourceFormat,
    targetFormat,
  };
}

/**
 * 正規化後のテキスト間の差分を生成する。
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
