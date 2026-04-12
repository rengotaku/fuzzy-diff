import { describe, it, expect } from "vitest";
import type { DiffItem } from "verify-ai";
import {
  findHighlightSpans,
  splitToSegments,
} from "./highlightMapper";
import type { HighlightSpan, TextSegment } from "./highlightMapper";

describe("findHighlightSpans", () => {
  // --- 基本的な位置特定 ---

  describe("基本的な位置特定", () => {
    it("changed の sourceValue が source テキスト内で正しい位置を返す", () => {
      const text = '{"name": "Tokyo"}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Tokyo", targetValue: "Osaka" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(1);
      expect(spans[0].start).toBe(text.indexOf("Tokyo"));
      expect(spans[0].end).toBe(text.indexOf("Tokyo") + "Tokyo".length);
      expect(spans[0].diffType).toBe("changed");
    });

    it("changed の targetValue が target テキスト内で正しい位置を返す", () => {
      const text = '{"name": "Osaka"}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Tokyo", targetValue: "Osaka" },
      ];
      const spans = findHighlightSpans(text, diffs, "target");
      expect(spans).toHaveLength(1);
      expect(spans[0].start).toBe(text.indexOf("Osaka"));
      expect(spans[0].end).toBe(text.indexOf("Osaka") + "Osaka".length);
      expect(spans[0].diffType).toBe("changed");
    });

    it("removed の sourceValue が source 側で位置を返す", () => {
      const text = "name,age\nAlice,30";
      const diffs: DiffItem[] = [
        { type: "removed", path: "age", sourceValue: "30", targetValue: null },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(1);
      expect(spans[0].diffType).toBe("removed");
      expect(text.slice(spans[0].start, spans[0].end)).toBe("30");
    });

    it("removed の DiffItem は target 側で空配列を返す", () => {
      const text = "name\nAlice";
      const diffs: DiffItem[] = [
        { type: "removed", path: "age", sourceValue: "30", targetValue: null },
      ];
      const spans = findHighlightSpans(text, diffs, "target");
      expect(spans).toHaveLength(0);
    });

    it("added の targetValue が target 側で位置を返す", () => {
      const text = '{"email": "a@b.com"}';
      const diffs: DiffItem[] = [
        { type: "added", path: "email", sourceValue: null, targetValue: "a@b.com" },
      ];
      const spans = findHighlightSpans(text, diffs, "target");
      expect(spans).toHaveLength(1);
      expect(spans[0].diffType).toBe("added");
      expect(text.slice(spans[0].start, spans[0].end)).toBe("a@b.com");
    });

    it("added の DiffItem は source 側で空配列を返す", () => {
      const text = '{"name": "Alice"}';
      const diffs: DiffItem[] = [
        { type: "added", path: "email", sourceValue: null, targetValue: "a@b.com" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(0);
    });
  });

  // --- 複数差分 ---

  describe("複数差分", () => {
    it("複数の DiffItem からそれぞれの位置を返す", () => {
      const text = '{"name": "Alice", "age": "30"}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
        { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(2);
      expect(text.slice(spans[0].start, spans[0].end)).toBe("Alice");
      expect(text.slice(spans[1].start, spans[1].end)).toBe("30");
    });

    it("span が start 昇順でソートされている", () => {
      const text = "age,name\n30,Alice";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
        { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < spans.length; i++) {
        expect(spans[i].start).toBeGreaterThanOrEqual(spans[i - 1].start);
      }
    });
  });

  // --- 重複値の順序保持 ---

  describe("同じ値が複数回出現する場合", () => {
    it("同一値の重複出現で順序を保持して位置を返す", () => {
      const text = "name,name2\nTokyo,Tokyo";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Tokyo", targetValue: "Osaka" },
        { type: "changed", path: "name2", sourceValue: "Tokyo", targetValue: "Kyoto" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(2);
      // 2つの "Tokyo" は異なる位置
      expect(spans[0].start).not.toBe(spans[1].start);
    });
  });

  // --- path が空文字の場合（テキストベース差分） ---

  describe("path が空文字の場合", () => {
    it("path が空文字の場合に行単位で検索する", () => {
      const text = "line1\nline2\nline3";
      const diffs: DiffItem[] = [
        { type: "removed", path: "", sourceValue: "line2", targetValue: null },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(1);
      expect(text.slice(spans[0].start, spans[0].end)).toBe("line2");
    });
  });

  // --- 値が見つからない場合 ---

  describe("値が見つからない場合", () => {
    it("テキスト内に値が存在しない場合は空配列を返す", () => {
      const text = '{"name": "Alice"}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "NotInText", targetValue: "Bob" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(0);
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("空文字列のテキストに対して空配列を返す", () => {
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
      ];
      const spans = findHighlightSpans("", diffs, "source");
      expect(spans).toHaveLength(0);
    });

    it("空の diffs 配列に対して空配列を返す", () => {
      const spans = findHighlightSpans("some text", [], "source");
      expect(spans).toHaveLength(0);
    });

    it("sourceValue/targetValue が空文字列の場合は空配列を返す", () => {
      const text = '{"name": ""}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "", targetValue: "Bob" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(0);
    });

    it("Unicode 文字を含む値の位置を正しく特定する", () => {
      const text = "name\n太郎";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "太郎", targetValue: "花子" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(1);
      expect(text.slice(spans[0].start, spans[0].end)).toBe("太郎");
    });

    it("特殊文字（括弧、カンマ等）を含む値の位置を正しく特定する", () => {
      const text = '{"desc": "price (100)"}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "desc", sourceValue: "price (100)", targetValue: "price (200)" },
      ];
      const spans = findHighlightSpans(text, diffs, "source");
      expect(spans).toHaveLength(1);
      expect(text.slice(spans[0].start, spans[0].end)).toBe("price (100)");
    });

    it("diffItem への参照を保持する", () => {
      const text = '{"name": "Alice"}';
      const diff: DiffItem = { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" };
      const spans = findHighlightSpans(text, [diff], "source");
      expect(spans).toHaveLength(1);
      expect(spans[0].diffItem).toBe(diff);
    });
  });
});

describe("splitToSegments", () => {
  // --- 基本的なセグメント分割 ---

  describe("基本的なセグメント分割", () => {
    it("ハイライトなしのテキストを1つの通常セグメントとして返す", () => {
      const segments = splitToSegments("hello world", []);
      expect(segments).toHaveLength(1);
      expect(segments[0].text).toBe("hello world");
      expect(segments[0].highlight).toBeNull();
    });

    it("テキスト全体がハイライトされる場合に1つのハイライトセグメントを返す", () => {
      const span: HighlightSpan = {
        start: 0,
        end: 5,
        diffType: "changed",
        diffItem: { type: "changed", path: "x", sourceValue: "hello", targetValue: "world" },
      };
      const segments = splitToSegments("hello", [span]);
      expect(segments).toHaveLength(1);
      expect(segments[0].text).toBe("hello");
      expect(segments[0].highlight).not.toBeNull();
      expect(segments[0].highlight?.diffType).toBe("changed");
    });

    it("テキストの一部がハイライトされる場合に3つのセグメントを返す", () => {
      const span: HighlightSpan = {
        start: 6,
        end: 11,
        diffType: "changed",
        diffItem: { type: "changed", path: "x", sourceValue: "world", targetValue: "earth" },
      };
      const segments = splitToSegments("hello world end", [span]);
      expect(segments).toHaveLength(3);
      expect(segments[0].text).toBe("hello ");
      expect(segments[0].highlight).toBeNull();
      expect(segments[1].text).toBe("world");
      expect(segments[1].highlight).not.toBeNull();
      expect(segments[2].text).toBe(" end");
      expect(segments[2].highlight).toBeNull();
    });
  });

  // --- 複数ハイライト ---

  describe("複数ハイライト", () => {
    it("複数の span で正しくセグメント分割される", () => {
      const text = "Alice is 30 years old";
      const spans: HighlightSpan[] = [
        {
          start: 0,
          end: 5,
          diffType: "changed",
          diffItem: { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
        },
        {
          start: 9,
          end: 11,
          diffType: "changed",
          diffItem: { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
        },
      ];
      const segments = splitToSegments(text, spans);
      expect(segments).toHaveLength(5);
      expect(segments[0]).toEqual({ text: "Alice", highlight: spans[0] });
      expect(segments[1]).toEqual({ text: " is ", highlight: null });
      expect(segments[2]).toEqual({ text: "30", highlight: spans[1] });
      expect(segments[3]).toEqual({ text: " years old", highlight: null });
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("空文字列のテキストに対して空配列を返す", () => {
      const segments = splitToSegments("", []);
      expect(segments).toHaveLength(0);
    });

    it("テキスト先頭からハイライトが始まる場合", () => {
      const span: HighlightSpan = {
        start: 0,
        end: 3,
        diffType: "added",
        diffItem: { type: "added", path: "x", sourceValue: null, targetValue: "foo" },
      };
      const segments = splitToSegments("foo bar", [span]);
      expect(segments).toHaveLength(2);
      expect(segments[0].text).toBe("foo");
      expect(segments[0].highlight).not.toBeNull();
      expect(segments[1].text).toBe(" bar");
      expect(segments[1].highlight).toBeNull();
    });

    it("テキスト末尾でハイライトが終わる場合", () => {
      const span: HighlightSpan = {
        start: 4,
        end: 7,
        diffType: "removed",
        diffItem: { type: "removed", path: "x", sourceValue: "bar", targetValue: null },
      };
      const segments = splitToSegments("foo bar", [span]);
      expect(segments).toHaveLength(2);
      expect(segments[0].text).toBe("foo ");
      expect(segments[0].highlight).toBeNull();
      expect(segments[1].text).toBe("bar");
      expect(segments[1].highlight).not.toBeNull();
    });

    it("隣接するハイライトが正しく分割される", () => {
      const spans: HighlightSpan[] = [
        {
          start: 0,
          end: 3,
          diffType: "changed",
          diffItem: { type: "changed", path: "a", sourceValue: "abc", targetValue: "xyz" },
        },
        {
          start: 3,
          end: 6,
          diffType: "added",
          diffItem: { type: "added", path: "b", sourceValue: null, targetValue: "def" },
        },
      ];
      const segments = splitToSegments("abcdef", spans);
      expect(segments).toHaveLength(2);
      expect(segments[0].text).toBe("abc");
      expect(segments[0].highlight?.diffType).toBe("changed");
      expect(segments[1].text).toBe("def");
      expect(segments[1].highlight?.diffType).toBe("added");
    });
  });
});
