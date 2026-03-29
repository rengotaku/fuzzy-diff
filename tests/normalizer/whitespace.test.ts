import { describe, it, expect } from "vitest";
import { normalizeWhitespace } from "../../src/normalizer/whitespace.js";

describe("normalizeWhitespace", () => {
  describe("連続空白の圧縮", () => {
    it("連続する半角スペースを1つに圧縮する", () => {
      expect(normalizeWhitespace("hello   world")).toBe("hello world");
    });

    it("3つ以上の連続スペースも1つに圧縮する", () => {
      expect(normalizeWhitespace("a     b      c")).toBe("a b c");
    });

    it("文中の複数箇所の連続空白をすべて圧縮する", () => {
      expect(normalizeWhitespace("foo  bar  baz  qux")).toBe("foo bar baz qux");
    });
  });

  describe("タブ→スペース変換", () => {
    it("タブ文字をスペースに変換する", () => {
      expect(normalizeWhitespace("hello\tworld")).toBe("hello world");
    });

    it("連続タブを1スペースに圧縮する", () => {
      expect(normalizeWhitespace("hello\t\tworld")).toBe("hello world");
    });

    it("タブとスペースの混在を1スペースに圧縮する", () => {
      expect(normalizeWhitespace("hello \t world")).toBe("hello world");
    });
  });

  describe("末尾空白のトリム", () => {
    it("先頭の空白を除去する", () => {
      expect(normalizeWhitespace("  hello")).toBe("hello");
    });

    it("末尾の空白を除去する", () => {
      expect(normalizeWhitespace("hello  ")).toBe("hello");
    });

    it("先頭と末尾の両方の空白を除去する", () => {
      expect(normalizeWhitespace("  hello  ")).toBe("hello");
    });

    it("各行の末尾空白を除去する", () => {
      expect(normalizeWhitespace("hello  \nworld  ")).toBe("hello\nworld");
    });
  });

  describe("改行コードの統一", () => {
    it("\\r\\n を \\n に統一する", () => {
      expect(normalizeWhitespace("hello\r\nworld")).toBe("hello\nworld");
    });

    it("\\r を \\n に統一する", () => {
      expect(normalizeWhitespace("hello\rworld")).toBe("hello\nworld");
    });

    it("混在する改行コードをすべて \\n に統一する", () => {
      expect(normalizeWhitespace("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
    });

    it("連続改行は保持する", () => {
      expect(normalizeWhitespace("hello\n\nworld")).toBe("hello\n\nworld");
    });
  });

  describe("エッジケース", () => {
    it("空文字列はそのまま返す", () => {
      expect(normalizeWhitespace("")).toBe("");
    });

    it("空白のみの文字列は空文字列になる", () => {
      expect(normalizeWhitespace("   \t  \t  ")).toBe("");
    });

    it("改行のみの文字列は改行を保持する", () => {
      expect(normalizeWhitespace("\n\n")).toBe("\n\n");
    });

    it("全角スペースはそのまま保持する（width.tsの担当）", () => {
      // 全角スペースの変換は width.ts で行うため、ここでは変換しない
      expect(normalizeWhitespace("hello\u3000world")).toBe("hello\u3000world");
    });

    it("変換不要なテキストはそのまま返す", () => {
      expect(normalizeWhitespace("hello world")).toBe("hello world");
    });

    it("非常に長いテキストを正常に処理する", () => {
      const long = "word ".repeat(5000).trim();
      const result = normalizeWhitespace(long);
      expect(result).toBe(long);
    });
  });
});
