import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { HighlightedText } from "./HighlightedText";
import type { TextSegment } from "@/utils/highlightMapper";

describe("HighlightedText", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("TextSegment[] をハイライト付き span で描画する", () => {
      const segments: TextSegment[] = [
        { text: "hello ", highlight: null },
        {
          text: "world",
          highlight: {
            start: 6,
            end: 11,
            diffType: "changed",
            diffItem: { type: "changed", path: "x", sourceValue: "world", targetValue: "earth" },
          },
        },
      ];
      render(<HighlightedText segments={segments} />);
      expect(screen.getByText("hello")).toBeTruthy();
      expect(screen.getByText("world")).toBeTruthy();
    });

    it("ハイライトなしセグメントが通常テキストとして描画される", () => {
      const segments: TextSegment[] = [
        { text: "plain text", highlight: null },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      const spans = container.querySelectorAll("span");
      // ハイライトなしの span には背景色が設定されない
      const plainSpan = Array.from(spans).find((s) => s.textContent === "plain text");
      expect(plainSpan).toBeDefined();
      expect(plainSpan?.style.backgroundColor).toBeFalsy();
    });
  });

  // --- 差分タイプに応じた色 ---

  describe("差分タイプに応じた色", () => {
    it("added タイプのセグメントに added 色が適用される", () => {
      const segments: TextSegment[] = [
        {
          text: "new value",
          highlight: {
            start: 0,
            end: 9,
            diffType: "added",
            diffItem: { type: "added", path: "x", sourceValue: null, targetValue: "new value" },
          },
        },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      const highlightedSpan = container.querySelector("[data-diff-type='added']");
      expect(highlightedSpan).not.toBeNull();
    });

    it("removed タイプのセグメントに removed 色が適用される", () => {
      const segments: TextSegment[] = [
        {
          text: "old value",
          highlight: {
            start: 0,
            end: 9,
            diffType: "removed",
            diffItem: { type: "removed", path: "x", sourceValue: "old value", targetValue: null },
          },
        },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      const highlightedSpan = container.querySelector("[data-diff-type='removed']");
      expect(highlightedSpan).not.toBeNull();
    });

    it("changed タイプのセグメントに changed 色が適用される", () => {
      const segments: TextSegment[] = [
        {
          text: "modified",
          highlight: {
            start: 0,
            end: 8,
            diffType: "changed",
            diffItem: { type: "changed", path: "x", sourceValue: "modified", targetValue: "updated" },
          },
        },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      const highlightedSpan = container.querySelector("[data-diff-type='changed']");
      expect(highlightedSpan).not.toBeNull();
    });

    it("各差分タイプが異なるスタイルで表示される", () => {
      const segments: TextSegment[] = [
        {
          text: "added",
          highlight: {
            start: 0, end: 5, diffType: "added",
            diffItem: { type: "added", path: "a", sourceValue: null, targetValue: "added" },
          },
        },
        { text: " ", highlight: null },
        {
          text: "removed",
          highlight: {
            start: 6, end: 13, diffType: "removed",
            diffItem: { type: "removed", path: "b", sourceValue: "removed", targetValue: null },
          },
        },
        { text: " ", highlight: null },
        {
          text: "changed",
          highlight: {
            start: 14, end: 21, diffType: "changed",
            diffItem: { type: "changed", path: "c", sourceValue: "changed", targetValue: "updated" },
          },
        },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      const addedEl = container.querySelector("[data-diff-type='added']");
      const removedEl = container.querySelector("[data-diff-type='removed']");
      const changedEl = container.querySelector("[data-diff-type='changed']");
      expect(addedEl).not.toBeNull();
      expect(removedEl).not.toBeNull();
      expect(changedEl).not.toBeNull();
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("空の segments 配列で何も描画しない", () => {
      const { container } = render(<HighlightedText segments={[]} />);
      expect(container.textContent).toBe("");
    });

    it("空文字列のセグメントを正しく処理する", () => {
      const segments: TextSegment[] = [
        { text: "", highlight: null },
        { text: "visible", highlight: null },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      expect(container.textContent).toContain("visible");
    });

    it("Unicode/絵文字を含むセグメントを正しく描画する", () => {
      const segments: TextSegment[] = [
        {
          text: "太郎",
          highlight: {
            start: 0, end: 2, diffType: "changed",
            diffItem: { type: "changed", path: "name", sourceValue: "太郎", targetValue: "花子" },
          },
        },
      ];
      render(<HighlightedText segments={segments} />);
      expect(screen.getByText("太郎")).toBeTruthy();
    });

    it("HTML 特殊文字がエスケープされて表示される", () => {
      const segments: TextSegment[] = [
        {
          text: "<script>alert('xss')</script>",
          highlight: {
            start: 0, end: 29, diffType: "changed",
            diffItem: { type: "changed", path: "x", sourceValue: "<script>alert('xss')</script>", targetValue: "safe" },
          },
        },
      ];
      render(<HighlightedText segments={segments} />);
      expect(screen.getByText("<script>alert('xss')</script>")).toBeTruthy();
    });

    it("大量のセグメント（1000件）でもクラッシュしない", () => {
      const segments: TextSegment[] = Array.from({ length: 1000 }, (_, i) => ({
        text: `item${i}`,
        highlight: i % 2 === 0 ? {
          start: i * 5, end: i * 5 + 5, diffType: "changed" as const,
          diffItem: { type: "changed" as const, path: `p${i}`, sourceValue: `item${i}`, targetValue: `new${i}` },
        } : null,
      }));
      const { container } = render(<HighlightedText segments={segments} />);
      expect(container.textContent).toContain("item0");
      expect(container.textContent).toContain("item999");
    });

    it("改行を含むテキストが保持される", () => {
      const segments: TextSegment[] = [
        { text: "line1\nline2\nline3", highlight: null },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      expect(container.textContent).toContain("line1");
      expect(container.textContent).toContain("line3");
    });
  });

  // --- Phase 3: US2 Tailwind 化後のブリンクアニメーション維持 ---

  describe("Tailwind 化後のブリンクアニメーション維持（US2）", () => {
    it("ハイライトセグメントにブリンクアニメーション用のクラスまたはスタイルが適用される", () => {
      const diffItem = {
        type: "changed" as const,
        path: "x",
        sourceValue: "old",
        targetValue: "new",
      };
      const segments: TextSegment[] = [
        {
          text: "old",
          highlight: {
            start: 0,
            end: 3,
            diffType: "changed",
            diffItem,
          },
        },
      ];
      const { container } = render(
        <HighlightedText
          segments={segments}
          hoveredDiffItem={diffItem}
          onHoverDiffItem={() => {}}
        />,
      );
      const highlightedSpan = container.querySelector("[data-diff-type='changed']") as HTMLElement;
      expect(highlightedSpan).not.toBeNull();
      // Tailwind 化後もブリンクアニメーションが維持されること
      // animate-diff-blink クラスまたは animation スタイルが適用される
      const hasBlinkClass = highlightedSpan.className.includes("animate-diff-blink");
      const hasBlinkStyle = highlightedSpan.style.animation?.includes("blink");
      expect(hasBlinkClass || hasBlinkStyle).toBe(true);
    });

    it("ホバーしていないセグメントにはブリンクアニメーションが適用されない", () => {
      const diffItem = {
        type: "changed" as const,
        path: "x",
        sourceValue: "old",
        targetValue: "new",
      };
      const otherDiffItem = {
        type: "changed" as const,
        path: "y",
        sourceValue: "aaa",
        targetValue: "bbb",
      };
      const segments: TextSegment[] = [
        {
          text: "old",
          highlight: {
            start: 0,
            end: 3,
            diffType: "changed",
            diffItem,
          },
        },
      ];
      const { container } = render(
        <HighlightedText
          segments={segments}
          hoveredDiffItem={otherDiffItem}
          onHoverDiffItem={() => {}}
        />,
      );
      const highlightedSpan = container.querySelector("[data-diff-type='changed']") as HTMLElement;
      expect(highlightedSpan).not.toBeNull();
      // ブリンクが適用されていないこと
      const hasBlinkClass = highlightedSpan.className.includes("animate-diff-blink");
      const hasBlinkStyle = highlightedSpan.style.animation?.includes("blink");
      expect(hasBlinkClass || hasBlinkStyle).toBe(false);
    });

    it("Tailwind 化後もハイライト色が適用される（bg-* クラスまたは inline style）", () => {
      const segments: TextSegment[] = [
        {
          text: "added-text",
          highlight: {
            start: 0,
            end: 10,
            diffType: "added",
            diffItem: { type: "added", path: "x", sourceValue: null, targetValue: "added-text" },
          },
        },
      ];
      const { container } = render(<HighlightedText segments={segments} />);
      const addedSpan = container.querySelector("[data-diff-type='added']") as HTMLElement;
      expect(addedSpan).not.toBeNull();
      // Tailwind クラス(bg-diff-added-bg)または inline style で色が適用されていること
      const hasTailwindBg = addedSpan.className.includes("bg-");
      const hasInlineStyle = Boolean(addedSpan.style.backgroundColor);
      expect(hasTailwindBg || hasInlineStyle).toBe(true);
    });
  });
});
