import { describe, it, expect } from "vitest";
import { kanaToHiragana } from "../../src/normalizer/kana.js";

describe("kanaToHiragana", () => {
  describe("カタカナ→ひらがな変換", () => {
    it("基本的なカタカナをひらがなに変換する", () => {
      expect(kanaToHiragana("カタカナ")).toBe("かたかな");
    });

    it("ア行のカタカナを変換する", () => {
      expect(kanaToHiragana("アイウエオ")).toBe("あいうえお");
    });

    it("カ行のカタカナを変換する", () => {
      expect(kanaToHiragana("カキクケコ")).toBe("かきくけこ");
    });

    it("サ行のカタカナを変換する", () => {
      expect(kanaToHiragana("サシスセソ")).toBe("さしすせそ");
    });

    it("濁音カタカナを変換する", () => {
      expect(kanaToHiragana("ガギグゲゴ")).toBe("がぎぐげご");
    });

    it("半濁音カタカナを変換する", () => {
      expect(kanaToHiragana("パピプペポ")).toBe("ぱぴぷぺぽ");
    });

    it("拗音カタカナを変換する", () => {
      expect(kanaToHiragana("キャキュキョ")).toBe("きゃきゅきょ");
    });

    it("小書きカタカナを変換する", () => {
      expect(kanaToHiragana("ァィゥェォ")).toBe("ぁぃぅぇぉ");
    });

    it("長音記号（ー）はそのまま保持する", () => {
      expect(kanaToHiragana("コーヒー")).toBe("こーひー");
    });

    it("カタカナの「ヴ」を変換する", () => {
      expect(kanaToHiragana("ヴァイオリン")).toBe("ゔぁいおりん");
    });
  });

  describe("ひらがなの保持", () => {
    it("ひらがなはそのまま保持する", () => {
      expect(kanaToHiragana("ひらがな")).toBe("ひらがな");
    });

    it("ひらがなの濁音・半濁音はそのまま保持する", () => {
      expect(kanaToHiragana("がぎぐげご")).toBe("がぎぐげご");
    });
  });

  describe("混在テキスト", () => {
    it("カタカナとひらがなの混在テキストを処理する", () => {
      expect(kanaToHiragana("カタカナとひらがな")).toBe("かたかなとひらがな");
    });

    it("漢字とカタカナの混在テキストを処理する", () => {
      expect(kanaToHiragana("東京タワー")).toBe("東京たわー");
    });

    it("英数字とカタカナの混在テキストを処理する", () => {
      expect(kanaToHiragana("ABC123カタカナ")).toBe("ABC123かたかな");
    });

    it("記号とカタカナの混在テキストを処理する", () => {
      expect(kanaToHiragana("テスト（カタカナ）")).toBe("てすと（かたかな）");
    });

    it("文章中のカタカナを変換する", () => {
      expect(kanaToHiragana("私はコーヒーが好きです")).toBe("私はこーひーが好きです");
    });
  });

  describe("エッジケース", () => {
    it("空文字列はそのまま返す", () => {
      expect(kanaToHiragana("")).toBe("");
    });

    it("漢字のみのテキストはそのまま返す", () => {
      expect(kanaToHiragana("漢字")).toBe("漢字");
    });

    it("英字のみのテキストはそのまま返す", () => {
      expect(kanaToHiragana("hello")).toBe("hello");
    });

    it("数字のみのテキストはそのまま返す", () => {
      expect(kanaToHiragana("12345")).toBe("12345");
    });

    it("絵文字を含むテキストを正常に処理する", () => {
      expect(kanaToHiragana("テスト🎉")).toBe("てすと🎉");
    });

    it("非常に長いテキストを正常に処理する", () => {
      const long = "カタカナ".repeat(3000);
      const result = kanaToHiragana(long);
      expect(result).toBe("かたかな".repeat(3000));
    });
  });
});
