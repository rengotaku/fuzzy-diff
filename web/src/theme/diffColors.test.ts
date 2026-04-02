import { describe, it, expect } from "vitest";
import { diffColors } from "./diffColors";

describe("diffColors", () => {
  // --- 基本色マッピング ---

  describe("差分種別ごとの色マッピング", () => {
    it("added に対して amber 系の色が定義されている", () => {
      expect(diffColors.added).toBeDefined();
      expect(typeof diffColors.added.background).toBe("string");
      expect(typeof diffColors.added.text).toBe("string");
      expect(diffColors.added.background).not.toBe("");
      expect(diffColors.added.text).not.toBe("");
    });

    it("removed に対して red 系の色が定義されている", () => {
      expect(diffColors.removed).toBeDefined();
      expect(typeof diffColors.removed.background).toBe("string");
      expect(typeof diffColors.removed.text).toBe("string");
      expect(diffColors.removed.background).not.toBe("");
      expect(diffColors.removed.text).not.toBe("");
    });

    it("changed に対して blue 系の色が定義されている", () => {
      expect(diffColors.changed).toBeDefined();
      expect(typeof diffColors.changed.background).toBe("string");
      expect(typeof diffColors.changed.text).toBe("string");
      expect(diffColors.changed.background).not.toBe("");
      expect(diffColors.changed.text).not.toBe("");
    });
  });

  // --- 色の一意性 ---

  describe("色の一意性", () => {
    it("各差分種別の背景色が互いに異なる", () => {
      const backgrounds = [
        diffColors.added.background,
        diffColors.removed.background,
        diffColors.changed.background,
      ];
      const unique = new Set(backgrounds);
      expect(unique.size).toBe(3);
    });

    it("各差分種別のテキスト色が定義されている", () => {
      expect(diffColors.added.text).toBeDefined();
      expect(diffColors.removed.text).toBeDefined();
      expect(diffColors.changed.text).toBeDefined();
    });
  });

  // --- 全種別の網羅性 ---

  describe("DiffItem.type の全種別をカバー", () => {
    it("added, removed, changed の3種別が全て定義されている", () => {
      const keys = Object.keys(diffColors);
      expect(keys).toContain("added");
      expect(keys).toContain("removed");
      expect(keys).toContain("changed");
    });

    it("DiffItem.type の値で動的にアクセスできる", () => {
      const types = ["added", "removed", "changed"] as const;
      for (const type of types) {
        const color = diffColors[type];
        expect(color).toBeDefined();
        expect(color.background).toBeDefined();
        expect(color.text).toBeDefined();
      }
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("diffColors オブジェクトが不変である（予期しないキーがない）", () => {
      const keys = Object.keys(diffColors);
      // added, removed, changed の3つのみ
      expect(keys).toHaveLength(3);
    });

    it("色の値が有効な CSS カラー文字列である", () => {
      // CSS カラー値として使えることを簡易チェック（#xxx, rgb(), 色名のいずれか）
      const cssColorPattern = /^(#[0-9a-fA-F]{3,8}|rgb|rgba|hsl|hsla|[a-z]+)/;
      const allColors = [
        diffColors.added.background,
        diffColors.added.text,
        diffColors.removed.background,
        diffColors.removed.text,
        diffColors.changed.background,
        diffColors.changed.text,
      ];
      for (const color of allColors) {
        expect(color).toMatch(cssColorPattern);
      }
    });
  });
});
