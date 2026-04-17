import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { DiffList } from "./DiffList";
import type { DiffItem } from "verify-ai";

describe("DiffList", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("差分リストが正しくレンダリングされる", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "row[0].name", sourceValue: null, targetValue: "Alice" },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/row\[0\]\.name/)).toBeInTheDocument();
    });

    it("複数の差分が全て表示される", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "row[0].name", sourceValue: null, targetValue: "Alice" },
        { type: "removed", path: "row[1].age", sourceValue: "30", targetValue: null },
        {
          type: "changed",
          path: "row[2].city",
          sourceValue: "Tokyo",
          targetValue: "Osaka",
        },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/row\[0\]\.name/)).toBeInTheDocument();
      expect(screen.getByText(/row\[1\]\.age/)).toBeInTheDocument();
      expect(screen.getByText(/row\[2\]\.city/)).toBeInTheDocument();
    });
  });

  // --- 差分種別ごとのハイライト色 ---

  describe("差分種別ごとのハイライト色", () => {
    it("added の差分に識別可能な視覚的スタイルが適用される", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "row[0].name", sourceValue: null, targetValue: "Alice" },
      ];
      const { container } = render(<DiffList diffs={diffs} />);
      // added 差分の要素にスタイルまたは data 属性が付与されていることを確認
      const addedElement = container.querySelector("[data-diff-type='added']");
      expect(addedElement).not.toBeNull();
    });

    it("removed の差分に識別可能な視覚的スタイルが適用される", () => {
      const diffs: DiffItem[] = [
        { type: "removed", path: "row[1].age", sourceValue: "30", targetValue: null },
      ];
      const { container } = render(<DiffList diffs={diffs} />);
      const removedElement = container.querySelector("[data-diff-type='removed']");
      expect(removedElement).not.toBeNull();
    });

    it("changed の差分に識別可能な視覚的スタイルが適用される", () => {
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "row[2].city",
          sourceValue: "Tokyo",
          targetValue: "Osaka",
        },
      ];
      const { container } = render(<DiffList diffs={diffs} />);
      const changedElement = container.querySelector("[data-diff-type='changed']");
      expect(changedElement).not.toBeNull();
    });

    it("各差分種別が異なるスタイルで表示される", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "path1", sourceValue: null, targetValue: "v1" },
        { type: "removed", path: "path2", sourceValue: "v2", targetValue: null },
        { type: "changed", path: "path3", sourceValue: "v3a", targetValue: "v3b" },
      ];
      const { container } = render(<DiffList diffs={diffs} />);
      const added = container.querySelector("[data-diff-type='added']");
      const removed = container.querySelector("[data-diff-type='removed']");
      const changed = container.querySelector("[data-diff-type='changed']");
      expect(added).not.toBeNull();
      expect(removed).not.toBeNull();
      expect(changed).not.toBeNull();
    });
  });

  // --- 差分種別のラベル/インジケータ表示 ---

  describe("差分種別のラベル表示", () => {
    it("added の差分に種別を示すテキストが表示される", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "row[0]", sourceValue: null, targetValue: "new" },
      ];
      render(<DiffList diffs={diffs} />);
      // "追加" や "added" のいずれかのラベルが表示される
      expect(screen.getByText(/追加|added/i)).toBeInTheDocument();
    });

    it("removed の差分に種別を示すテキストが表示される", () => {
      const diffs: DiffItem[] = [
        { type: "removed", path: "row[0]", sourceValue: "old", targetValue: null },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/欠落|削除|removed/i)).toBeInTheDocument();
    });

    it("changed の差分に種別を示すテキストが表示される", () => {
      const diffs: DiffItem[] = [
        { type: "changed", path: "row[0]", sourceValue: "a", targetValue: "b" },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/変更|changed/i)).toBeInTheDocument();
    });
  });

  // --- sourceValue / targetValue の表示 ---

  describe("sourceValue / targetValue の表示", () => {
    it("added の差分で targetValue が表示される", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "row[0].name", sourceValue: null, targetValue: "Alice" },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });

    it("removed の差分で sourceValue が表示される", () => {
      const diffs: DiffItem[] = [
        { type: "removed", path: "row[0].name", sourceValue: "Bob", targetValue: null },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
    });

    it("changed の差分で sourceValue と targetValue の両方が表示される", () => {
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "row[0].city",
          sourceValue: "Tokyo",
          targetValue: "Osaka",
        },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/Tokyo/)).toBeInTheDocument();
      expect(screen.getByText(/Osaka/)).toBeInTheDocument();
    });

    it("changed の差分で元の値と変更後の値が区別できる", () => {
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "row[0].city",
          sourceValue: "Tokyo",
          targetValue: "Osaka",
        },
      ];
      const { container } = render(<DiffList diffs={diffs} />);
      // sourceValue と targetValue が別々の要素に表示される
      const sourceEl = container.querySelector("[data-value-type='source']");
      const targetEl = container.querySelector("[data-value-type='target']");
      expect(sourceEl).not.toBeNull();
      expect(targetEl).not.toBeNull();
      expect(sourceEl?.textContent).toContain("Tokyo");
      expect(targetEl?.textContent).toContain("Osaka");
    });
  });

  // --- 空リスト時の表示 ---

  describe("空リスト時の表示", () => {
    it("差分が空の場合「差分なし」メッセージが表示される", () => {
      render(<DiffList diffs={[]} />);
      expect(screen.getByText(/差分なし/)).toBeInTheDocument();
    });

    it("差分が空の場合リストアイテムが表示されない", () => {
      const { container } = render(<DiffList diffs={[]} />);
      const diffItems = container.querySelectorAll("[data-diff-type]");
      expect(diffItems).toHaveLength(0);
    });
  });

  // --- パス表示 ---

  describe("パス表示", () => {
    it("各差分のパスが表示される", () => {
      const diffs: DiffItem[] = [
        {
          type: "added",
          path: "data.users[0].email",
          sourceValue: null,
          targetValue: "a@b.com",
        },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/data\.users\[0\]\.email/)).toBeInTheDocument();
    });

    it("特殊文字を含むパスが正しく表示される", () => {
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "row[0].名前",
          sourceValue: "太郎",
          targetValue: "花子",
        },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/名前/)).toBeInTheDocument();
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("sourceValue が null の added 差分を正しく表示する", () => {
      const diffs: DiffItem[] = [
        { type: "added", path: "row[0]", sourceValue: null, targetValue: "value" },
      ];
      render(<DiffList diffs={diffs} />);
      // sourceValue が null でもクラッシュしない
      expect(screen.getByText(/value/)).toBeInTheDocument();
    });

    it("targetValue が null の removed 差分を正しく表示する", () => {
      const diffs: DiffItem[] = [
        { type: "removed", path: "row[0]", sourceValue: "value", targetValue: null },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/value/)).toBeInTheDocument();
    });

    it("空文字列の値を持つ差分を正しく表示する", () => {
      const diffs: DiffItem[] = [
        { type: "changed", path: "row[0].note", sourceValue: "", targetValue: "updated" },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/updated/)).toBeInTheDocument();
    });

    it("Unicode/絵文字を含む値を正しく表示する", () => {
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "row[0].name",
          sourceValue: "太郎",
          targetValue: "花子",
        },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/太郎/)).toBeInTheDocument();
      expect(screen.getByText(/花子/)).toBeInTheDocument();
    });

    it("大量の差分（100件）を表示してもクラッシュしない", () => {
      const diffs: DiffItem[] = Array.from({ length: 100 }, (_, i) => ({
        type: "changed" as const,
        path: `row[${i}].field`,
        sourceValue: `old${i}`,
        targetValue: `new${i}`,
      }));
      const { container } = render(<DiffList diffs={diffs} />);
      const diffItems = container.querySelectorAll("[data-diff-type]");
      expect(diffItems).toHaveLength(100);
    });

    it("HTML 特殊文字を含む値がエスケープされて表示される", () => {
      const diffs: DiffItem[] = [
        {
          type: "changed",
          path: "row[0]",
          sourceValue: "<script>alert('xss')</script>",
          targetValue: "safe",
        },
      ];
      render(<DiffList diffs={diffs} />);
      // スクリプトタグがテキストとして表示され、実行されないことを確認
      expect(screen.getByText(/<script>/)).toBeInTheDocument();
      expect(screen.getByText(/safe/)).toBeInTheDocument();
    });

    it("SQL 特殊文字を含む値を正しく表示する", () => {
      const diffs: DiffItem[] = [
        {
          type: "added",
          path: "row[0]",
          sourceValue: null,
          targetValue: "Robert'; DROP TABLE users;--",
        },
      ];
      render(<DiffList diffs={diffs} />);
      expect(screen.getByText(/Robert/)).toBeInTheDocument();
    });
  });
});
