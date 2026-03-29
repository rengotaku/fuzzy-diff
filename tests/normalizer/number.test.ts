import { describe, it, expect } from "vitest";
import { normalizeNumber } from "../../src/normalizer/number.js";

describe("normalizeNumber", () => {
  describe("日本語数量表現の変換", () => {
    it("「万」を数値に展開する", () => {
      expect(normalizeNumber("1250万円")).toBe("12500000円");
    });

    it("「億」を数値に展開する", () => {
      expect(normalizeNumber("3億円")).toBe("300000000円");
    });

    it("「兆」を数値に展開する", () => {
      expect(normalizeNumber("1兆円")).toBe("1000000000000円");
    });

    it("小数を含む万を展開する", () => {
      expect(normalizeNumber("1.5万人")).toBe("15000人");
    });

    it("「万」と「億」の組み合わせを展開する", () => {
      expect(normalizeNumber("1億2500万円")).toBe("125000000円");
    });

    it("「千」を数値に展開する", () => {
      expect(normalizeNumber("3千円")).toBe("3000円");
    });

    it("文中に複数の数量表現がある場合をすべて変換する", () => {
      const input = "売上1250万円、利益300万円";
      const result = normalizeNumber(input);
      expect(result).toBe("売上12500000円、利益3000000円");
    });
  });

  describe("通貨記号の正規化", () => {
    it("¥記号を除去する", () => {
      expect(normalizeNumber("¥12,500")).toBe("12500");
    });

    it("￥（全角）記号を除去する", () => {
      expect(normalizeNumber("￥12,500")).toBe("12500");
    });

    it("「円」の単位を保持する", () => {
      expect(normalizeNumber("12500円")).toBe("12500円");
    });

    it("$記号を保持する（日本語数値正規化の範囲外）", () => {
      expect(normalizeNumber("$100")).toBe("$100");
    });
  });

  describe("カンマ区切りの除去", () => {
    it("3桁カンマ区切りを除去する", () => {
      expect(normalizeNumber("12,500,000")).toBe("12500000");
    });

    it("数値中のカンマのみ除去する", () => {
      expect(normalizeNumber("合計: 1,234,567円")).toBe("合計: 1234567円");
    });

    it("カンマなし数値はそのまま保持する", () => {
      expect(normalizeNumber("12500000")).toBe("12500000");
    });
  });

  describe("日付フォーマット", () => {
    it("日付文字列はそのまま保持する（変換しない）", () => {
      expect(normalizeNumber("2026/03/29")).toBe("2026/03/29");
    });

    it("日付中のカンマは除去しない", () => {
      expect(normalizeNumber("March 29, 2026")).toBe("March 29, 2026");
    });

    it("年月日表記はそのまま保持する", () => {
      expect(normalizeNumber("2026年3月29日")).toBe("2026年3月29日");
    });
  });

  describe("複合的な変換", () => {
    it("¥記号とカンマ区切りを同時に処理する", () => {
      expect(normalizeNumber("¥12,500,000")).toBe("12500000");
    });

    it("万円表記と¥記号の混在テキストを処理する", () => {
      const input = "予算は1250万円（¥12,500,000）です";
      const result = normalizeNumber(input);
      expect(result).toBe("予算は12500000円（12500000）です");
    });

    it("パーセントを含む数値表現を処理する", () => {
      expect(normalizeNumber("増加率15.5%")).toBe("増加率15.5%");
    });
  });

  describe("エッジケース", () => {
    it("空文字列はそのまま返す", () => {
      expect(normalizeNumber("")).toBe("");
    });

    it("数値を含まないテキストはそのまま返す", () => {
      expect(normalizeNumber("テスト文字列")).toBe("テスト文字列");
    });

    it("0を正しく処理する", () => {
      expect(normalizeNumber("0円")).toBe("0円");
    });

    it("負の数値を正しく処理する", () => {
      expect(normalizeNumber("-1,000")).toBe("-1000");
    });

    it("小数点を含む数値を正しく処理する", () => {
      expect(normalizeNumber("3.14")).toBe("3.14");
    });

    it("非常に大きい数値を正しく処理する", () => {
      expect(normalizeNumber("100兆円")).toBe("100000000000000円");
    });

    it("非常に長いテキストを正常に処理する", () => {
      const long = "金額は1,000円です。".repeat(2000);
      const result = normalizeNumber(long);
      expect(result).toContain("1000円");
      expect(result).not.toContain("1,000");
    });
  });
});
