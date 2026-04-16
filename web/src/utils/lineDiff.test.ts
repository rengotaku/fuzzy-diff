import { describe, it, expect } from "vitest";
import { buildUnifiedLines, buildSideBySidePairs } from "./lineDiff";
import type { SideBySideLinePair } from "./lineDiff";
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

// ============================================================
// Phase 4: US3 — buildSideBySidePairs テスト
// ============================================================

describe("buildSideBySidePairs（US3: Side-by-Side ペア生成）", () => {
  // --- 基本動作 ---

  describe("基本動作", () => {
    it("同一テキストの場合、各行が left/right ペアとして返る", () => {
      const text = "line1\nline2\nline3";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(text, text, diffs);
      expect(pairs).toHaveLength(3);
      for (const pair of pairs) {
        expect(pair.left).not.toBeNull();
        expect(pair.right).not.toBeNull();
        expect(pair.left!.isPlaceholder).toBe(false);
        expect(pair.right!.isPlaceholder).toBe(false);
      }
    });

    it("返り値が SideBySideLinePair の構造を持つ", () => {
      const source = "hello";
      const target = "hello";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      expect(pairs.length).toBeGreaterThan(0);
      const pair = pairs[0];
      // left/right の構造確認
      expect(pair.left).toHaveProperty("lineNumber");
      expect(pair.left).toHaveProperty("text");
      expect(pair.left).toHaveProperty("type");
      expect(pair.left).toHaveProperty("isPlaceholder");
      expect(pair).toHaveProperty("leftLineNumber");
      expect(pair).toHaveProperty("rightLineNumber");
    });

    it("changed 差分で left が source 行、right が target 行になる", () => {
      const source = "name: Alice";
      const target = "name: Bob";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
      ];
      const pairs = buildSideBySidePairs(source, target, diffs);
      // 少なくとも1ペアが存在
      expect(pairs.length).toBeGreaterThanOrEqual(1);
      // source 側と target 側が含まれる
      const hasSourceText = pairs.some((p) => p.left?.text.includes("Alice"));
      const hasTargetText = pairs.some((p) => p.right?.text.includes("Bob"));
      expect(hasSourceText).toBe(true);
      expect(hasTargetText).toBe(true);
    });
  });

  // --- 左右独立行番号 ---

  describe("左右独立行番号", () => {
    it("left の行番号が 1 から始まる連番である", () => {
      const source = "a\nb\nc";
      const target = "a\nb\nc";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      const leftNumbers = pairs
        .filter((p) => p.left !== null && !p.left.isPlaceholder)
        .map((p) => p.leftLineNumber);
      expect(leftNumbers).toEqual([1, 2, 3]);
    });

    it("right の行番号が 1 から始まる連番である", () => {
      const source = "a\nb\nc";
      const target = "a\nb\nc";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      const rightNumbers = pairs
        .filter((p) => p.right !== null && !p.right.isPlaceholder)
        .map((p) => p.rightLineNumber);
      expect(rightNumbers).toEqual([1, 2, 3]);
    });

    it("leftLineNumber と left.lineNumber が一致する", () => {
      const source = "x\ny";
      const target = "x\ny";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      for (const pair of pairs) {
        if (pair.left !== null) {
          expect(pair.leftLineNumber).toBe(pair.left.lineNumber);
        }
      }
    });

    it("rightLineNumber と right.lineNumber が一致する", () => {
      const source = "x\ny";
      const target = "x\ny";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      for (const pair of pairs) {
        if (pair.right !== null) {
          expect(pair.rightLineNumber).toBe(pair.right.lineNumber);
        }
      }
    });

    it("source が target より多い行数の場合でも左右の行番号がそれぞれ独立", () => {
      const source = "a\nb\nc\nd";
      const target = "a\nb";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      // left は 1..4、right は 1..2（プレースホルダー除く）
      const leftNums = pairs
        .filter((p) => p.left !== null && !p.left.isPlaceholder)
        .map((p) => p.leftLineNumber);
      const rightNums = pairs
        .filter((p) => p.right !== null && !p.right.isPlaceholder)
        .map((p) => p.rightLineNumber);
      expect(leftNums.length).toBe(4);
      expect(rightNums.length).toBe(2);
      expect(leftNums).toEqual([1, 2, 3, 4]);
      expect(rightNums).toEqual([1, 2]);
    });
  });

  // --- プレースホルダー行 ---

  describe("プレースホルダー行", () => {
    it("source にのみ行がある場合、right がプレースホルダーになる", () => {
      const source = "a\nb\nc";
      const target = "a";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      // source にしかない行では right が null またはプレースホルダー
      const placeholderPairs = pairs.filter(
        (p) => p.right === null || p.right.isPlaceholder,
      );
      expect(placeholderPairs.length).toBeGreaterThan(0);
    });

    it("target にのみ行がある場合、left がプレースホルダーになる", () => {
      const source = "a";
      const target = "a\nb\nc";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      const placeholderPairs = pairs.filter(
        (p) => p.left === null || p.left.isPlaceholder,
      );
      expect(placeholderPairs.length).toBeGreaterThan(0);
    });

    it("プレースホルダー行の lineNumber は null である", () => {
      const source = "a\nb";
      const target = "a";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      // right がプレースホルダーのペアを探す
      const placeholderPair = pairs.find(
        (p) => p.right === null || (p.right !== null && p.right.isPlaceholder),
      );
      expect(placeholderPair).toBeDefined();
      if (placeholderPair!.right === null) {
        expect(placeholderPair!.rightLineNumber).toBeNull();
      } else {
        expect(placeholderPair!.right.lineNumber).toBeNull();
        expect(placeholderPair!.rightLineNumber).toBeNull();
      }
    });

    it("プレースホルダー行の isPlaceholder が true である（null でない場合）", () => {
      const source = "a\nb\nc";
      const target = "a";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      for (const pair of pairs) {
        if (pair.right !== null && pair.right.isPlaceholder) {
          expect(pair.right.isPlaceholder).toBe(true);
          expect(pair.right.text).toBe("");
        }
      }
    });

    it("removed 差分で right 側がプレースホルダーになる", () => {
      const source = "name,age\nBob,40";
      const target = "name,age";
      const diffs: DiffItem[] = [
        { type: "removed", path: "name", sourceValue: "Bob", targetValue: null },
      ];
      const pairs = buildSideBySidePairs(source, target, diffs);
      // Bob,40 の行に対応する right がプレースホルダー
      const removedPair = pairs.find(
        (p) => p.left !== null && p.left.text.includes("Bob"),
      );
      expect(removedPair).toBeDefined();
      expect(
        removedPair!.right === null || removedPair!.right.isPlaceholder,
      ).toBe(true);
    });

    it("added 差分で left 側がプレースホルダーになる", () => {
      const source = "name";
      const target = "name\nAlice";
      const diffs: DiffItem[] = [
        { type: "added", path: "name", sourceValue: null, targetValue: "Alice" },
      ];
      const pairs = buildSideBySidePairs(source, target, diffs);
      const addedPair = pairs.find(
        (p) => p.right !== null && p.right.text.includes("Alice"),
      );
      expect(addedPair).toBeDefined();
      expect(
        addedPair!.left === null || addedPair!.left.isPlaceholder,
      ).toBe(true);
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("両方空文字の場合は空配列を返す", () => {
      const pairs = buildSideBySidePairs("", "", []);
      expect(pairs).toEqual([]);
    });

    it("source が空で target のみの場合、全行の left がプレースホルダー", () => {
      const pairs = buildSideBySidePairs("", "a\nb", []);
      expect(pairs.length).toBeGreaterThan(0);
      for (const pair of pairs) {
        expect(pair.left === null || pair.left.isPlaceholder).toBe(true);
        expect(pair.right).not.toBeNull();
      }
    });

    it("target が空で source のみの場合、全行の right がプレースホルダー", () => {
      const pairs = buildSideBySidePairs("a\nb", "", []);
      expect(pairs.length).toBeGreaterThan(0);
      for (const pair of pairs) {
        expect(pair.left).not.toBeNull();
        expect(pair.right === null || pair.right.isPlaceholder).toBe(true);
      }
    });

    it("1行のみの完全一致", () => {
      const pairs = buildSideBySidePairs("single", "single", []);
      expect(pairs).toHaveLength(1);
      expect(pairs[0].left!.text).toBe("single");
      expect(pairs[0].right!.text).toBe("single");
      expect(pairs[0].leftLineNumber).toBe(1);
      expect(pairs[0].rightLineNumber).toBe(1);
    });

    it("Unicode/絵文字を含む行", () => {
      const source = "名前: 太郎";
      const target = "名前: 花子";
      const diffs: DiffItem[] = [
        { type: "changed", path: "名前", sourceValue: "太郎", targetValue: "花子" },
      ];
      const pairs = buildSideBySidePairs(source, target, diffs);
      expect(pairs.length).toBeGreaterThan(0);
      const hasSource = pairs.some((p) => p.left?.text.includes("太郎"));
      const hasTarget = pairs.some((p) => p.right?.text.includes("花子"));
      expect(hasSource).toBe(true);
      expect(hasTarget).toBe(true);
    });

    it("大量行（100行）でもクラッシュしない", () => {
      const sourceLines = Array.from({ length: 100 }, (_, i) => `line${i}`);
      const targetLines = Array.from({ length: 100 }, (_, i) => `line${i}`);
      const source = sourceLines.join("\n");
      const target = targetLines.join("\n");
      const pairs = buildSideBySidePairs(source, target, []);
      expect(pairs.length).toBe(100);
    });

    it("特殊文字（HTML, SQL）を含む行が正しく処理される", () => {
      const source = '<script>alert("xss")</script>';
      const target = "SELECT * FROM users;";
      const diffs: DiffItem[] = [];
      const pairs = buildSideBySidePairs(source, target, diffs);
      expect(pairs.length).toBeGreaterThan(0);
    });
  });
});
