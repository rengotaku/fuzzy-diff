import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { SideBySideView } from "./SideBySideView";
import type { DiffItem } from "verify-ai";
const diffColors = {
  added: { background: "#d4f4dd", text: "#16a34a" },
  removed: { background: "#fdd4d4", text: "#dc2626" },
  changed: { background: "#dbeafe", text: "#1d4ed8" },
} as const;

describe("SideBySideView", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("source と target が左右に表示される", () => {
      const source = "name,age\nAlice,30";
      const target = '{"name":"Alice","age":30}';
      const diffs: DiffItem[] = [];
      render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      expect(screen.getByText(/Alice,30/)).toBeInTheDocument();
      expect(screen.getByText(/"Alice"/)).toBeInTheDocument();
    });

    it("source 側と target 側がそれぞれ独立したペインに存在する", () => {
      const source = "source text here";
      const target = "target text here";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      // 左右ペインは data-testid で区別される
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const targetPane = container.querySelector(
        "[data-testid='target-pane']",
      );
      expect(sourcePane).not.toBeNull();
      expect(targetPane).not.toBeNull();
      expect(sourcePane?.textContent).toContain("source text here");
      expect(targetPane?.textContent).toContain("target text here");
    });
  });

  // --- 差分ハイライト ---

  describe("差分ハイライト", () => {
    it("差分箇所がハイライトされる", () => {
      const source = "name,age\nAlice,30";
      const target = "name,age\nAlice,25";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "age",
          sourceValue: "30",
          targetValue: "25",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const highlighted = container.querySelectorAll(
        "[data-diff-type='changed']",
      );
      expect(highlighted.length).toBeGreaterThanOrEqual(1);
    });

    it("source 側で changed 値がハイライトされる", () => {
      const source = "price: 100";
      const target = "price: 200";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "price",
          sourceValue: "100",
          targetValue: "200",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const changedSpan = sourcePane?.querySelector(
        "[data-diff-type='changed']",
      );
      expect(changedSpan).not.toBeNull();
      expect(changedSpan?.textContent).toBe("100");
    });

    it("target 側で changed 値がハイライトされる", () => {
      const source = "price: 100";
      const target = "price: 200";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "price",
          sourceValue: "100",
          targetValue: "200",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const targetPane = container.querySelector(
        "[data-testid='target-pane']",
      );
      const changedSpan = targetPane?.querySelector(
        "[data-diff-type='changed']",
      );
      expect(changedSpan).not.toBeNull();
      expect(changedSpan?.textContent).toBe("200");
    });

    it("removed 差分で source 側のみハイライトされる", () => {
      const source = "name,age\nBob,40";
      const target = "name,age";
      const diffs: DiffItem[] = [
        {
          type: "removed",
          path: "name",
          sourceValue: "Bob",
          targetValue: null,
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const targetPane = container.querySelector(
        "[data-testid='target-pane']",
      );
      const sourceHighlight = sourcePane?.querySelector(
        "[data-diff-type='removed']",
      );
      const targetHighlight = targetPane?.querySelector(
        "[data-diff-type='removed']",
      );
      expect(sourceHighlight).not.toBeNull();
      expect(sourceHighlight?.textContent).toBe("Bob");
      expect(targetHighlight).toBeNull();
    });

    it("added 差分で target 側のみハイライトされる", () => {
      const source = "name\n";
      const target = "name\nAlice";
      const diffs: DiffItem[] = [
        {
          type: "added",
          path: "name",
          sourceValue: null,
          targetValue: "Alice",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const targetPane = container.querySelector(
        "[data-testid='target-pane']",
      );
      const sourceHighlight = sourcePane?.querySelector(
        "[data-diff-type='added']",
      );
      const targetHighlight = targetPane?.querySelector(
        "[data-diff-type='added']",
      );
      expect(sourceHighlight).toBeNull();
      expect(targetHighlight).not.toBeNull();
      expect(targetHighlight?.textContent).toBe("Alice");
    });

    it("差分タイプに応じた背景色が適用される", () => {
      const source = "value: old";
      const target = "value: new";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "value",
          sourceValue: "old",
          targetValue: "new",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const changedSpan = container.querySelector(
        "[data-diff-type='changed']",
      );
      expect(changedSpan).not.toBeNull();
      const style = (changedSpan as HTMLElement).style;
      // jsdom returns rgb() format regardless of input format
      expect(style.backgroundColor).toBe("rgb(219, 234, 254)");
    });
  });

  // --- 値部分のみハイライト（フォーマット構文を含まない） ---

  describe("ハイライトは値部分のみ", () => {
    it("JSON の括弧やコロンはハイライトされない", () => {
      const source = '{"name": "Alice", "age": "30"}';
      const target = '{"name": "Alice", "age": "25"}';
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "age",
          sourceValue: "30",
          targetValue: "25",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const changedSpan = sourcePane?.querySelector(
        "[data-diff-type='changed']",
      );
      // ハイライトされるのは値 "30" のみ、括弧やコロンは含まない
      expect(changedSpan?.textContent).toBe("30");
    });

    it("CSV のカンマや改行はハイライトされない", () => {
      const source = "name,age\nAlice,30";
      const target = "name,age\nAlice,25";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "age",
          sourceValue: "30",
          targetValue: "25",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const changedSpan = sourcePane?.querySelector(
        "[data-diff-type='changed']",
      );
      expect(changedSpan?.textContent).toBe("30");
    });
  });

  // --- 差分なし ---

  describe("差分なし", () => {
    it("差分がない場合にハイライトなしで表示される", () => {
      const text = "name,age\nAlice,30";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <SideBySideView source={text} target={text} diffs={diffs} />,
      );
      const highlighted = container.querySelectorAll("[data-diff-type]");
      expect(highlighted).toHaveLength(0);
      // テキスト自体は表示される
      expect(screen.getAllByText(/Alice,30/).length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- 片方が空 ---

  describe("片方が空の場合", () => {
    it("source が空の場合に source 側に「テキストなし」が表示される", () => {
      const diffs: DiffItem[] = [];
      const { container } = render(
        <SideBySideView source="" target="some text" diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      expect(sourcePane?.textContent).toContain("テキストなし");
    });

    it("target が空の場合に target 側に「テキストなし」が表示される", () => {
      const diffs: DiffItem[] = [];
      const { container } = render(
        <SideBySideView source="some text" target="" diffs={diffs} />,
      );
      const targetPane = container.querySelector(
        "[data-testid='target-pane']",
      );
      expect(targetPane?.textContent).toContain("テキストなし");
    });

    it("両方が空の場合に両側に「テキストなし」が表示される", () => {
      const diffs: DiffItem[] = [];
      const { container } = render(
        <SideBySideView source="" target="" diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const targetPane = container.querySelector(
        "[data-testid='target-pane']",
      );
      expect(sourcePane?.textContent).toContain("テキストなし");
      expect(targetPane?.textContent).toContain("テキストなし");
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("Unicode/絵文字を含む値が正しくハイライトされる", () => {
      const source = "名前: 太郎";
      const target = "名前: 花子";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "名前",
          sourceValue: "太郎",
          targetValue: "花子",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const changedSpan = sourcePane?.querySelector(
        "[data-diff-type='changed']",
      );
      expect(changedSpan?.textContent).toBe("太郎");
    });

    it("HTML 特殊文字を含むテキストがエスケープされて表示される", () => {
      const source = '<div>old</div>';
      const target = '<div>new</div>';
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "content",
          sourceValue: "old",
          targetValue: "new",
        },
      ];
      render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      // HTML がテキストとして表示される（実行されない）
      const matches = screen.getAllByText(/<div>/);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("複数の差分が正しくハイライトされる", () => {
      const source = "name: Alice, age: 30, city: Tokyo";
      const target = "name: Bob, age: 25, city: Osaka";
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "name",
          sourceValue: "Alice",
          targetValue: "Bob",
        },
        {
          type: "changed",
          path: "age",
          sourceValue: "30",
          targetValue: "25",
        },
        {
          type: "changed",
          path: "city",
          sourceValue: "Tokyo",
          targetValue: "Osaka",
        },
      ];
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const changedSpans = sourcePane?.querySelectorAll(
        "[data-diff-type='changed']",
      );
      expect(changedSpans?.length).toBe(3);
    });

    it("大量の差分（100件）を表示してもクラッシュしない", () => {
      const sourceLines = Array.from(
        { length: 100 },
        (_, i) => `field${i}: old${i}`,
      );
      const targetLines = Array.from(
        { length: 100 },
        (_, i) => `field${i}: new${i}`,
      );
      const source = sourceLines.join("\n");
      const target = targetLines.join("\n");
      const diffs: DiffItem[] = Array.from({ length: 100 }, (_, i) => ({
        type: "changed" as const,
        path: `field${i}`,
        sourceValue: `old${i}`,
        targetValue: `new${i}`,
      }));
      const { container } = render(
        <SideBySideView source={source} target={target} diffs={diffs} />,
      );
      const sourcePane = container.querySelector(
        "[data-testid='source-pane']",
      );
      const changedSpans = sourcePane?.querySelectorAll(
        "[data-diff-type='changed']",
      );
      expect(changedSpans?.length).toBe(100);
    });
  });
});
