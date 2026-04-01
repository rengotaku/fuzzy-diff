import { describe, it, expect } from "vitest";
import { calculateScore, isMatch } from "../../src/comparator/scorer.js";

describe("calculateScore", () => {
  it("fuzzballスコア100を1.0に変換する", () => {
    expect(calculateScore(100)).toBe(1.0);
  });

  it("fuzzballスコア0を0.0に変換する", () => {
    expect(calculateScore(0)).toBe(0.0);
  });

  it("fuzzballスコア75を0.75に変換する", () => {
    expect(calculateScore(75)).toBe(0.75);
  });

  it("小数点以下は丸める", () => {
    const score = calculateScore(66);
    expect(score).toBeCloseTo(0.66, 2);
  });
});

describe("isMatch", () => {
  describe("デフォルト閾値", () => {
    it("高スコアはmatchと判定する", () => {
      expect(isMatch(0.95)).toBe(true);
    });

    it("低スコアはmismatchと判定する", () => {
      expect(isMatch(0.3)).toBe(false);
    });
  });

  describe("カスタム閾値", () => {
    it("閾値以上のスコアはmatchと判定する", () => {
      expect(isMatch(0.5, 0.5)).toBe(true);
    });

    it("閾値未満のスコアはmismatchと判定する", () => {
      expect(isMatch(0.49, 0.5)).toBe(false);
    });
  });
});
