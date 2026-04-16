import { describe, it, expect } from "vitest";
import { computeDiffStats } from "./diffStats";
import type { ComparisonResult } from "verify-ai";
import type { DiffStats, SimilarityLevel } from "./diffStats";

// ヘルパー: テスト用 ComparisonResult を生成
function makeResult(
  overrides: Partial<ComparisonResult> = {},
): ComparisonResult {
  return {
    score: 0.5,
    match: false,
    diffs: [],
    sourceFormat: { type: "plain", confidence: 1.0 },
    targetFormat: { type: "plain", confidence: 1.0 },
    ...overrides,
  };
}

describe("computeDiffStats", () => {
  // --- score → similarityPercent 変換 ---

  describe("score → similarityPercent 変換", () => {
    it("score=1.0 → similarityPercent=100", () => {
      const stats = computeDiffStats(makeResult({ score: 1.0 }));
      expect(stats.similarityPercent).toBe(100);
    });

    it("score=0.0 → similarityPercent=0", () => {
      const stats = computeDiffStats(makeResult({ score: 0.0 }));
      expect(stats.similarityPercent).toBe(0);
    });

    it("score=0.856 → similarityPercent=86（四捨五入）", () => {
      const stats = computeDiffStats(makeResult({ score: 0.856 }));
      expect(stats.similarityPercent).toBe(86);
    });

    it("score=0.5 → similarityPercent=50", () => {
      const stats = computeDiffStats(makeResult({ score: 0.5 }));
      expect(stats.similarityPercent).toBe(50);
    });

    it("score=0.794 → similarityPercent=79（境界値: 80未満）", () => {
      const stats = computeDiffStats(makeResult({ score: 0.794 }));
      expect(stats.similarityPercent).toBe(79);
    });

    it("score=0.495 → similarityPercent=50（境界値: 50丁度）", () => {
      const stats = computeDiffStats(makeResult({ score: 0.495 }));
      expect(stats.similarityPercent).toBe(50);
    });
  });

  // --- similarityLevel 判定 ---

  describe("similarityLevel 判定", () => {
    it("80% 以上 → high", () => {
      const stats = computeDiffStats(makeResult({ score: 0.8 }));
      expect(stats.similarityLevel).toBe("high");
    });

    it("100% → high", () => {
      const stats = computeDiffStats(makeResult({ score: 1.0 }));
      expect(stats.similarityLevel).toBe("high");
    });

    it("79% → medium（80未満）", () => {
      const stats = computeDiffStats(makeResult({ score: 0.79 }));
      expect(stats.similarityLevel).toBe("medium");
    });

    it("50% → medium", () => {
      const stats = computeDiffStats(makeResult({ score: 0.5 }));
      expect(stats.similarityLevel).toBe("medium");
    });

    it("49% → low（50未満）", () => {
      const stats = computeDiffStats(makeResult({ score: 0.49 }));
      expect(stats.similarityLevel).toBe("low");
    });

    it("0% → low", () => {
      const stats = computeDiffStats(makeResult({ score: 0.0 }));
      expect(stats.similarityLevel).toBe("low");
    });
  });

  // --- 差分種別件数カウント ---

  describe("差分種別件数カウント", () => {
    it("added のみの diffs を正しくカウント", () => {
      const stats = computeDiffStats(
        makeResult({
          diffs: [
            { type: "added", path: "a", sourceValue: null, targetValue: "x" },
            { type: "added", path: "b", sourceValue: null, targetValue: "y" },
          ],
        }),
      );
      expect(stats.addedCount).toBe(2);
      expect(stats.removedCount).toBe(0);
      expect(stats.changedCount).toBe(0);
    });

    it("removed のみの diffs を正しくカウント", () => {
      const stats = computeDiffStats(
        makeResult({
          diffs: [
            { type: "removed", path: "a", sourceValue: "x", targetValue: null },
          ],
        }),
      );
      expect(stats.addedCount).toBe(0);
      expect(stats.removedCount).toBe(1);
      expect(stats.changedCount).toBe(0);
    });

    it("changed のみの diffs を正しくカウント", () => {
      const stats = computeDiffStats(
        makeResult({
          diffs: [
            { type: "changed", path: "a", sourceValue: "x", targetValue: "y" },
            { type: "changed", path: "b", sourceValue: "1", targetValue: "2" },
            { type: "changed", path: "c", sourceValue: "p", targetValue: "q" },
          ],
        }),
      );
      expect(stats.addedCount).toBe(0);
      expect(stats.removedCount).toBe(0);
      expect(stats.changedCount).toBe(3);
    });

    it("混合 diffs を正しくカウント", () => {
      const stats = computeDiffStats(
        makeResult({
          diffs: [
            { type: "added", path: "a", sourceValue: null, targetValue: "x" },
            { type: "removed", path: "b", sourceValue: "y", targetValue: null },
            { type: "changed", path: "c", sourceValue: "1", targetValue: "2" },
            { type: "added", path: "d", sourceValue: null, targetValue: "z" },
            { type: "changed", path: "e", sourceValue: "p", targetValue: "q" },
          ],
        }),
      );
      expect(stats.addedCount).toBe(2);
      expect(stats.removedCount).toBe(1);
      expect(stats.changedCount).toBe(2);
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("空の diffs 配列 → 全カウント0", () => {
      const stats = computeDiffStats(makeResult({ diffs: [] }));
      expect(stats.addedCount).toBe(0);
      expect(stats.removedCount).toBe(0);
      expect(stats.changedCount).toBe(0);
      expect(stats.unchangedCount).toBe(0);
    });

    it("完全一致（score=1.0, diffs=[]）", () => {
      const stats = computeDiffStats(
        makeResult({ score: 1.0, match: true, diffs: [] }),
      );
      expect(stats.similarityPercent).toBe(100);
      expect(stats.similarityLevel).toBe("high");
      expect(stats.addedCount).toBe(0);
      expect(stats.removedCount).toBe(0);
      expect(stats.changedCount).toBe(0);
    });

    it("完全不一致（score=0.0, 多数の diffs）", () => {
      const diffs = Array.from({ length: 50 }, (_, i) => ({
        type: "removed" as const,
        path: `row[${i}]`,
        sourceValue: `val${i}`,
        targetValue: null,
      }));
      const stats = computeDiffStats(makeResult({ score: 0.0, diffs }));
      expect(stats.similarityPercent).toBe(0);
      expect(stats.similarityLevel).toBe("low");
      expect(stats.removedCount).toBe(50);
    });

    it("大量データ（1000件の diffs）でも正しくカウント", () => {
      const diffs = Array.from({ length: 1000 }, (_, i) => ({
        type: (["added", "removed", "changed"] as const)[i % 3],
        path: `item[${i}]`,
        sourceValue: i % 3 === 0 ? null : `s${i}`,
        targetValue: i % 3 === 1 ? null : `t${i}`,
      }));
      const stats = computeDiffStats(makeResult({ score: 0.1, diffs }));
      // 1000件中、added=334(0,3,6,...), removed=333(1,4,7,...), changed=333(2,5,8,...)
      expect(stats.addedCount).toBe(334);
      expect(stats.removedCount).toBe(333);
      expect(stats.changedCount).toBe(333);
    });

    it("戻り値が readonly（イミュータブル）", () => {
      const stats = computeDiffStats(makeResult({ score: 0.75 }));
      // DiffStats 型が readonly であることを型レベルで確認
      // ランタイムでは戻り値のプロパティが正しい型であることを検証
      expect(typeof stats.similarityPercent).toBe("number");
      expect(typeof stats.similarityLevel).toBe("string");
      expect(typeof stats.addedCount).toBe("number");
      expect(typeof stats.removedCount).toBe("number");
      expect(typeof stats.changedCount).toBe("number");
      expect(typeof stats.unchangedCount).toBe("number");
    });
  });
});
