import { describe, it, expect } from "vitest";
import { buildUnifiedLines } from "./lineDiff";
import type { DiffItem } from "verify-ai";

describe("lineDiff 拡張: lineNumber フィールド", () => {
  // --- lineNumber の基本動作 ---

  describe("lineNumber の基本動作", () => {
    it("buildUnifiedLines が返す DiffLine に lineNumber フィールドが含まれる", () => {
      const source = "line1\nline2";
      const target = "line1\nline2";
      const diffs: DiffItem[] = [];
      const result = buildUnifiedLines(source, target, diffs);
      expect(result.length).toBeGreaterThan(0);
      for (const line of result) {
        expect(line).toHaveProperty("lineNumber");
      }
    });

    it("行番号が 1 から始まる連番である", () => {
      const source = "aaa\nbbb\nccc";
      const target = "aaa\nbbb\nccc";
      const diffs: DiffItem[] = [];
      const result = buildUnifiedLines(source, target, diffs);
      const lineNumbers = result.map((line) => line.lineNumber);
      expect(lineNumbers).toEqual([1, 2, 3]);
    });

    it("changed-source と changed-target の行番号も連番で振られる", () => {
      const source = "name: Alice";
      const target = "name: Bob";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
      ];
      const result = buildUnifiedLines(source, target, diffs);
      // changed-source, changed-target の2行が返る
      expect(result.length).toBe(2);
      expect(result[0].lineNumber).toBe(1);
      expect(result[1].lineNumber).toBe(2);
    });

    it("removed + added + unchanged が混在する場合も連番", () => {
      const source = "header\nold line\nfooter";
      const target = "header\nnew line\nfooter";
      const diffs: DiffItem[] = [];
      const result = buildUnifiedLines(source, target, diffs);
      // 行番号が途切れず連番であること
      const lineNumbers = result.map((line) => line.lineNumber);
      for (let i = 0; i < lineNumbers.length; i++) {
        expect(lineNumbers[i]).toBe(i + 1);
      }
    });
  });

  // --- lineNumber の型 ---

  describe("lineNumber の型", () => {
    it("通常行の lineNumber は number 型である", () => {
      const source = "hello";
      const target = "hello";
      const diffs: DiffItem[] = [];
      const result = buildUnifiedLines(source, target, diffs);
      expect(result.length).toBe(1);
      expect(typeof result[0].lineNumber).toBe("number");
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("空入力の場合は空配列を返す（lineNumber も不要）", () => {
      const result = buildUnifiedLines("", "", []);
      expect(result).toEqual([]);
    });

    it("1行のみの場合 lineNumber は 1", () => {
      const result = buildUnifiedLines("single", "single", []);
      expect(result.length).toBe(1);
      expect(result[0].lineNumber).toBe(1);
    });

    it("大量行（100行）でも連番が正しい", () => {
      const lines = Array.from({ length: 100 }, (_, i) => `line${i}`);
      const text = lines.join("\n");
      const result = buildUnifiedLines(text, text, []);
      expect(result.length).toBe(100);
      expect(result[0].lineNumber).toBe(1);
      expect(result[99].lineNumber).toBe(100);
    });

    it("Unicode を含む行でも lineNumber が付与される", () => {
      const source = "名前: 太郎\n年齢: 30";
      const target = "名前: 花子\n年齢: 25";
      const diffs: DiffItem[] = [
        { type: "changed", path: "名前", sourceValue: "太郎", targetValue: "花子" },
        { type: "changed", path: "年齢", sourceValue: "30", targetValue: "25" },
      ];
      const result = buildUnifiedLines(source, target, diffs);
      for (const line of result) {
        expect(line.lineNumber).toBeDefined();
        expect(typeof line.lineNumber).toBe("number");
      }
    });
  });
});
