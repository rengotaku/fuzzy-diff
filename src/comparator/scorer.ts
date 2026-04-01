// スコアリング: fuzzballスコア(0-100)を正規化スコア(0.0-1.0)に変換し、match判定

const DEFAULT_THRESHOLD = 0.65;

/**
 * fuzzballスコア(0-100)を正規化スコア(0.0-1.0)に変換する。
 */
export function calculateScore(fuzzballScore: number): number {
  return Math.round((fuzzballScore / 100) * 100) / 100;
}

/**
 * スコアが閾値以上かどうかでmatch/mismatchを判定する。
 */
export function isMatch(score: number, threshold?: number): boolean {
  return score >= (threshold ?? DEFAULT_THRESHOLD);
}
