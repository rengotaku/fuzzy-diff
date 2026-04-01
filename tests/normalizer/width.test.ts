import { describe, it, expect } from "vitest";
import { normalizeWidth } from "../../src/normalizer/width.js";

describe("normalizeWidth", () => {
  describe("全角英数字→半角", () => {
    it("全角英大文字を半角に変換する", () => {
      expect(normalizeWidth("ＡＢＣＤＥ")).toBe("ABCDE");
    });

    it("全角英小文字を半角に変換する", () => {
      expect(normalizeWidth("ａｂｃｄｅ")).toBe("abcde");
    });

    it("全角数字を半角に変換する", () => {
      expect(normalizeWidth("０１２３４５６７８９")).toBe("0123456789");
    });

    it("全角英数字が混在するテキストを変換する", () => {
      expect(normalizeWidth("Ｔｅｓｔ１２３")).toBe("Test123");
    });

    it("半角英数字はそのまま保持する", () => {
      expect(normalizeWidth("Test123")).toBe("Test123");
    });
  });

  describe("全角記号→半角", () => {
    it("全角括弧を半角に変換する", () => {
      expect(normalizeWidth("（テスト）")).toBe("(テスト)");
    });

    it("全角コロン・セミコロンを半角に変換する", () => {
      expect(normalizeWidth("項目：値；備考")).toBe("項目:値;備考");
    });

    it("全角スペースを半角スペースに変換する", () => {
      expect(normalizeWidth("hello\u3000world")).toBe("hello world");
    });

    it("全角ハイフン・マイナスを半角に変換する", () => {
      expect(normalizeWidth("Ａ－Ｂ")).toBe("A-B");
    });

    it("全角スラッシュを半角に変換する", () => {
      expect(normalizeWidth("２０２６／０３／２９")).toBe("2026/03/29");
    });

    it("全角感嘆符・疑問符を半角に変換する", () => {
      expect(normalizeWidth("すごい！本当？")).toBe("すごい!本当?");
    });
  });

  describe("半角カナ→全角カナ", () => {
    it("半角カタカナを全角カタカナに変換する", () => {
      expect(normalizeWidth("ｶﾀｶﾅ")).toBe("カタカナ");
    });

    it("半角カタカナの濁点を結合する", () => {
      expect(normalizeWidth("ｶﾞｷﾞｸﾞ")).toBe("ガギグ");
    });

    it("半角カタカナの半濁点を結合する", () => {
      expect(normalizeWidth("ﾊﾟﾋﾟﾌﾟ")).toBe("パピプ");
    });

    it("半角カナと全角カナの混在テキストを処理する", () => {
      expect(normalizeWidth("ｶﾀカナ")).toBe("カタカナ");
    });

    it("半角中黒を全角に変換する", () => {
      expect(normalizeWidth("ﾃｽﾄ･ｹｰｽ")).toBe("テスト・ケース");
    });
  });

  describe("混在テキスト", () => {
    it("日本語と全角英数字の混在テキストを処理する", () => {
      expect(normalizeWidth("合計：￥１２，５００")).toBe("合計:¥12,500");
    });

    it("ひらがなはそのまま保持する", () => {
      expect(normalizeWidth("ひらがな")).toBe("ひらがな");
    });

    it("漢字はそのまま保持する", () => {
      expect(normalizeWidth("漢字テスト")).toBe("漢字テスト");
    });
  });

  describe("エッジケース", () => {
    it("空文字列はそのまま返す", () => {
      expect(normalizeWidth("")).toBe("");
    });

    it("半角のみのテキストはそのまま返す", () => {
      expect(normalizeWidth("hello world 123")).toBe("hello world 123");
    });

    it("絵文字を含むテキストを正常に処理する", () => {
      const input = "テスト🎉ＯＫ";
      const result = normalizeWidth(input);
      expect(result).toContain("OK");
      expect(result).toContain("🎉");
    });

    it("非常に長いテキストを正常に処理する", () => {
      const long = "ＡＢＣ".repeat(3000);
      const result = normalizeWidth(long);
      expect(result).toBe("ABC".repeat(3000));
    });
  });
});
