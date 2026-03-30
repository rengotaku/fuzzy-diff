// テキストfuzzy比較: fuzzball を使用した類似度スコア算出

import { token_set_ratio } from "fuzzball/lite";

const FUZZ_OPTIONS = {
  full_process: true,
  force_ascii: false,
} as const;

/**
 * 2つのテキストの類似度をfuzzballで算出する。
 * 行単位で比較し、行ごとのスコアを加重平均する。
 * 行数が異なる場合は、全体テキストでの比較も行い、高い方を採用する。
 *
 * @returns 0-100 のスコア（fuzzball形式）
 */
export function compareText(source: string, target: string): number {
  if (source === target) return 100;
  if (source === "" || target === "") return 0;

  const wholeScore = token_set_ratio(source, target, FUZZ_OPTIONS);

  const sourceLines = source.split("\n").filter(Boolean);
  const targetLines = target.split("\n").filter(Boolean);

  if (sourceLines.length === 0 || targetLines.length === 0) {
    return wholeScore;
  }

  // 行数が一致する場合は行単位比較を試行
  if (sourceLines.length === targetLines.length) {
    let totalScore = 0;
    for (let i = 0; i < sourceLines.length; i++) {
      totalScore += token_set_ratio(sourceLines[i], targetLines[i], FUZZ_OPTIONS);
    }
    const lineAvgScore = Math.round(totalScore / sourceLines.length);
    return Math.max(wholeScore, lineAvgScore);
  }

  return wholeScore;
}
