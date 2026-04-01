import { describe, it, expect } from "vitest";
import { compareText } from "../../src/comparator/text.js";

describe("compareText", () => {
  describe("完全一致", () => {
    it("同一文字列はスコア100を返す", () => {
      expect(compareText("hello", "hello")).toBe(100);
    });

    it("空文字列同士はスコア100を返す（完全一致扱い）", () => {
      // 仕様: 両方空文字 → match（類似度 1.0）
      expect(compareText("", "")).toBe(100);
    });
  });

  describe("部分一致", () => {
    it("類似する文字列は高いスコアを返す", () => {
      const score = compareText("hello world", "hello  world");
      expect(score).toBeGreaterThan(80);
    });

    it("全く異なる文字列は低いスコアを返す", () => {
      const score = compareText("りんご みかん バナナ", "東京 大阪 名古屋");
      expect(score).toBeLessThan(30);
    });
  });

  describe("トークンベースの比較", () => {
    it("単語の順序が異なっても高いスコアを返す", () => {
      const score = compareText("A B C D", "D C B A");
      expect(score).toBeGreaterThan(80);
    });

    it("同じ単語セットは順序に関わらず高スコア", () => {
      const score = compareText(
        "りんご みかん バナナ",
        "バナナ りんご みかん",
      );
      expect(score).toBeGreaterThan(80);
    });
  });

  describe("日本語テキスト", () => {
    it("正規化済みテキストで高スコアを返す", () => {
      const score = compareText(
        "商品名 価格 在庫\nりんご 150円 20個",
        "商品名 価格 在庫\nりんご 150円 20個",
      );
      expect(score).toBe(100);
    });
  });
});
