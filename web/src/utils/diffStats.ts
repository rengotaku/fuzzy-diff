import type { ComparisonResult } from "verify-ai";

export type SimilarityLevel = "high" | "medium" | "low";

export interface DiffStats {
  readonly similarityPercent: number;
  readonly addedCount: number;
  readonly removedCount: number;
  readonly changedCount: number;
  readonly unchangedCount: number;
  readonly similarityLevel: SimilarityLevel;
}

export function computeDiffStats(result: ComparisonResult): DiffStats {
  const similarityPercent = Math.round(result.score * 100);

  const addedCount = result.diffs.filter((d) => d.type === "added").length;
  const removedCount = result.diffs.filter((d) => d.type === "removed").length;
  const changedCount = result.diffs.filter((d) => d.type === "changed").length;
  const unchangedCount = 0; // 将来: 全体行数 - 差分行数

  const similarityLevel: SimilarityLevel =
    similarityPercent >= 80 ? "high" : similarityPercent >= 50 ? "medium" : "low";

  return {
    similarityPercent,
    addedCount,
    removedCount,
    changedCount,
    unchangedCount,
    similarityLevel,
  };
}
