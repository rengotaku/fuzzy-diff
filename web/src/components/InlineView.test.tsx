import { describe, it, expect } from "vitest";
import { render } from "@/test/test-utils";
import { InlineView } from "./InlineView";
import type { DiffItem } from "verify-ai";

describe("InlineView", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("unified diff 形式で行が表示される", () => {
      const source = "name,age\nAlice,30";
      const target = "name,age\nAlice,25";
      const diffs: DiffItem[] = [
        { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const view = container.querySelector("[data-testid='inline-view']");
      expect(view).not.toBeNull();
      // 行が存在する
      const lines = container.querySelectorAll("[data-line-type]");
      expect(lines.length).toBeGreaterThanOrEqual(1);
    });

    it("同じ行は unchanged として表示される", () => {
      const source = "header\nAlice,30";
      const target = "header\nAlice,25";
      const diffs: DiffItem[] = [
        { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const unchangedLines = container.querySelectorAll("[data-line-type='unchanged']");
      expect(unchangedLines.length).toBeGreaterThanOrEqual(1);
      expect(unchangedLines[0].textContent).toContain("header");
    });
  });

  // --- 変更行の表示 ---

  describe("変更行の表示", () => {
    it("changed の source 行と target 行が連続して表示される", () => {
      const source = "price: 100";
      const target = "price: 200";
      const diffs: DiffItem[] = [
        { type: "changed", path: "price", sourceValue: "100", targetValue: "200" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const allLines = container.querySelectorAll("[data-line-type]");
      const types = Array.from(allLines).map((el) => el.getAttribute("data-line-type"));
      // changed-source と changed-target が含まれる
      expect(types).toContain("changed-source");
      expect(types).toContain("changed-target");
    });

    it("changed-source 行に差分値がハイライトされる", () => {
      const source = "name: Alice";
      const target = "name: Bob";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const changedSource = container.querySelector("[data-line-type='changed-source']");
      const highlight = changedSource?.querySelector("[data-diff-type='changed']");
      expect(highlight).not.toBeNull();
      expect(highlight?.textContent).toBe("Alice");
    });

    it("changed-target 行に差分値がハイライトされる", () => {
      const source = "name: Alice";
      const target = "name: Bob";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const changedTarget = container.querySelector("[data-line-type='changed-target']");
      const highlight = changedTarget?.querySelector("[data-diff-type='changed']");
      expect(highlight).not.toBeNull();
      expect(highlight?.textContent).toBe("Bob");
    });
  });

  // --- 削除・追加行 ---

  describe("削除・追加行の表示", () => {
    it("source にのみある行が removed として表示される", () => {
      const source = "line1\nline2\nline3";
      const target = "line1\nline3";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const removedLines = container.querySelectorAll("[data-line-type='removed']");
      expect(removedLines.length).toBeGreaterThanOrEqual(1);
      expect(removedLines[0].textContent).toContain("line2");
    });

    it("target にのみある行が added として表示される", () => {
      const source = "line1\nline3";
      const target = "line1\nline2\nline3";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const addedLines = container.querySelectorAll("[data-line-type='added']");
      expect(addedLines.length).toBeGreaterThanOrEqual(1);
      expect(addedLines[0].textContent).toContain("line2");
    });
  });

  // --- 行プレフィックス ---

  describe("行プレフィックス", () => {
    it("removed 行に - プレフィックスが表示される", () => {
      const source = "old line\nnew line";
      const target = "new line";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const removedLine = container.querySelector("[data-line-type='removed']");
      expect(removedLine?.textContent).toContain("- ");
    });

    it("added 行に + プレフィックスが表示される", () => {
      const source = "old line";
      const target = "old line\nnew line";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const addedLine = container.querySelector("[data-line-type='added']");
      expect(addedLine?.textContent).toContain("+ ");
    });
  });

  // --- 差分なし ---

  describe("差分なし", () => {
    it("同一テキストの場合すべて unchanged として表示される", () => {
      const text = "line1\nline2";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={text} target={text} diffs={diffs} />
      );
      const unchangedLines = container.querySelectorAll("[data-line-type='unchanged']");
      expect(unchangedLines).toHaveLength(2);
      const highlighted = container.querySelectorAll("[data-diff-type]");
      expect(highlighted).toHaveLength(0);
    });
  });

  // --- 両方空 ---

  describe("両方空の場合", () => {
    it("「テキストなし」が表示される", () => {
      const { container } = render(<InlineView source="" target="" diffs={[]} />);
      expect(container.textContent).toContain("テキストなし");
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("Unicode を含む変更行が正しく表示される", () => {
      const source = "名前: 太郎";
      const target = "名前: 花子";
      const diffs: DiffItem[] = [
        { type: "changed", path: "名前", sourceValue: "太郎", targetValue: "花子" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const changedSource = container.querySelector("[data-line-type='changed-source']");
      expect(changedSource?.textContent).toContain("太郎");
    });

    it("複数の変更が正しく表示される", () => {
      const source = "name: Alice\nage: 30\ncity: Tokyo";
      const target = "name: Bob\nage: 25\ncity: Osaka";
      const diffs: DiffItem[] = [
        { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
        { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
        { type: "changed", path: "city", sourceValue: "Tokyo", targetValue: "Osaka" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const changedSourceLines = container.querySelectorAll(
        "[data-line-type='changed-source']"
      );
      const changedTargetLines = container.querySelectorAll(
        "[data-line-type='changed-target']"
      );
      expect(changedSourceLines.length).toBe(3);
      expect(changedTargetLines.length).toBe(3);
    });

    it("大量の行でもクラッシュしない", () => {
      const sourceLines = Array.from({ length: 100 }, (_, i) => `field${i}: old${i}`);
      const targetLines = Array.from({ length: 100 }, (_, i) => `field${i}: new${i}`);
      const source = sourceLines.join("\n");
      const target = targetLines.join("\n");
      const diffs: DiffItem[] = Array.from({ length: 100 }, (_, i) => ({
        type: "changed" as const,
        path: `field${i}`,
        sourceValue: `old${i}`,
        targetValue: `new${i}`,
      }));
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const allLines = container.querySelectorAll("[data-line-type]");
      expect(allLines.length).toBeGreaterThanOrEqual(100);
    });

    it("CSV vs JSON の異フォーマットでも行が表示される", () => {
      const source = "name,age\nAlice,30";
      const target = '{"name":"Alice","age":"25"}';
      const diffs: DiffItem[] = [
        { type: "changed", path: "age", sourceValue: "30", targetValue: "25" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const allLines = container.querySelectorAll("[data-line-type]");
      expect(allLines.length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Phase 3: US2 行番号・プレフィックスグレー・モノスペース ---

  describe("行番号表示", () => {
    it("各行の左端に行番号が表示される", () => {
      const source = "line1\nline2\nline3";
      const target = "line1\nline2\nline3";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const lineNumberElements = container.querySelectorAll("[data-line-number]");
      expect(lineNumberElements.length).toBe(3);
      expect(lineNumberElements[0].textContent).toBe("1");
      expect(lineNumberElements[1].textContent).toBe("2");
      expect(lineNumberElements[2].textContent).toBe("3");
    });

    it("changed-source と changed-target にも行番号が表示される", () => {
      const source = "value: old";
      const target = "value: new";
      const diffs: DiffItem[] = [
        { type: "changed", path: "value", sourceValue: "old", targetValue: "new" },
      ];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const lineNumberElements = container.querySelectorAll("[data-line-number]");
      expect(lineNumberElements.length).toBeGreaterThanOrEqual(2);
      // 行番号が1から連番であること
      const numbers = Array.from(lineNumberElements).map((el) => el.textContent);
      expect(numbers[0]).toBe("1");
      expect(numbers[1]).toBe("2");
    });

    it("行番号が固定幅のカラムに表示される", () => {
      const source = "aaa\nbbb";
      const target = "aaa\nbbb";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const lineNumberElements = container.querySelectorAll("[data-line-number]");
      expect(lineNumberElements.length).toBeGreaterThan(0);
      // 固定幅を持つ要素であること（min-width または w-* クラス）
      const firstLineNum = lineNumberElements[0] as HTMLElement;
      expect(firstLineNum.className).toMatch(/w-|min-w/);
    });
  });

  describe("プレフィックス記号のグレー表示", () => {
    it("プレフィックス記号がグレーカラーで表示される", () => {
      const source = "old line";
      const target = "old line\nnew line";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      // プレフィックス表示用要素に text-gray-400 等のグレークラスが適用されていること
      const prefixElements = container.querySelectorAll("[data-prefix]");
      expect(prefixElements.length).toBeGreaterThan(0);
      const prefixEl = prefixElements[0] as HTMLElement;
      expect(prefixEl.className).toMatch(/text-gray/);
    });
  });

  describe("モノスペースフォント", () => {
    it("ビューア全体に font-mono クラスが適用される", () => {
      const source = "line1";
      const target = "line1";
      const diffs: DiffItem[] = [];
      const { container } = render(
        <InlineView source={source} target={target} diffs={diffs} />
      );
      const view = container.querySelector("[data-testid='inline-view']") as HTMLElement;
      expect(view).not.toBeNull();
      expect(view.className).toMatch(/font-mono/);
    });
  });
});
