// テキスト比較: fuzzball + 多角的スコアリング

import { ratio, token_set_ratio } from "fuzzball/lite";

const FUZZ_OPTIONS = {
  full_process: true,
  force_ascii: false,
} as const;

/**
 * 2つのテキストの類似度を多角的に算出する。
 * - ratio: 文字レベルの編集距離（情報の欠落・追加を検出）
 * - token_set_ratio: トークン集合の類似度（順序変更に対応）
 * - lineF1: 行単位のマッチング（行レベルの対応を評価）
 * - 数値オーバーラップ: 具体的な値の一致度（捏造検出）
 *
 * @returns 0-100 のスコア
 */
export function compareText(source: string, target: string): number {
  if (source === target) return 100;
  if (source === "" || target === "") return 0;

  const r = ratio(source, target, FUZZ_OPTIONS);
  const tsr = token_set_ratio(source, target, FUZZ_OPTIONS);
  const lf1 = lineMatchF1(source, target);
  const lr = lengthRatio(source, target);
  const numOvl = numberOverlap(source, target);

  // Length-mismatch detection: tsr >> ratio when content is subset/superset
  if (tsr - r > 20 && tsr > 85) {
    if (lr > 0.75) {
      return tsr; // reordering (same content, different order)
    }
    // Info loss/addition (lengths differ significantly)
    return Math.round(r * Math.sqrt(lr));
  }

  // Base score: best of text metrics
  let score = Math.max(r, lf1);

  // Number overlap penalty: detect fabrication/hallucination
  if (numOvl < 60) {
    score = Math.min(score, Math.round(score * numOvl / 80));
  }

  return score;
}

/**
 * 行単位のベストマッチF1スコア。
 * 各ソース行に対して最も類似するターゲット行を見つけ、
 * recall/precisionのF1スコアを算出する。
 */
function lineMatchF1(source: string, target: string): number {
  const sLines = source.split("\n").map((l) => l.trim()).filter((l) => l.length > 3);
  const tLines = target.split("\n").map((l) => l.trim()).filter((l) => l.length > 3);

  if (sLines.length === 0 && tLines.length === 0) return 100;
  if (sLines.length === 0 || tLines.length === 0) return 0;

  let recallTotal = 0;
  for (const sl of sLines) {
    let best = 0;
    for (const tl of tLines) {
      best = Math.max(best, ratio(sl, tl, FUZZ_OPTIONS));
    }
    recallTotal += best;
  }

  let precisionTotal = 0;
  for (const tl of tLines) {
    let best = 0;
    for (const sl of sLines) {
      best = Math.max(best, ratio(tl, sl, FUZZ_OPTIONS));
    }
    precisionTotal += best;
  }

  const recall = recallTotal / sLines.length;
  const precision = precisionTotal / tLines.length;

  if (recall + precision === 0) return 0;
  return Math.round((2 * recall * precision) / (recall + precision));
}

/**
 * コンテンツ長の比率（短い方 / 長い方）。
 */
function lengthRatio(source: string, target: string): number {
  const sl = source.replace(/\s+/g, "").length;
  const tl = target.replace(/\s+/g, "").length;
  if (sl === 0 && tl === 0) return 1;
  return Math.min(sl, tl) / Math.max(sl, tl);
}

/**
 * 数値オーバーラップ: ソースの数値がターゲットに含まれる割合。
 * 捏造・ハルシネーション検出に有効。
 */
function numberOverlap(source: string, target: string): number {
  const sNums = extractNumbers(source);
  const tNums = extractNumbers(target);
  if (sNums.size === 0 && tNums.size === 0) return 100;
  if (sNums.size === 0 || tNums.size === 0) return 50;

  let found = 0;
  for (const n of sNums) {
    if (tNums.has(n)) found++;
  }
  return Math.round((found / sNums.size) * 100);
}

/**
 * テキストから数値パターンを抽出する。
 */
function extractNumbers(text: string): Set<string> {
  const matches = text.match(/\d[\d,.]*\d|\d/g) ?? [];
  return new Set(matches.map((m) => m.replace(/,/g, "")));
}
