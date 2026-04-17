import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { Badge } from "./Badge";
import type { BadgeVariant } from "./Badge";

describe("Badge", () => {
  // --- variant ごとのクラス適用 ---

  describe("variant ごとの正しいクラス適用", () => {
    const variantExpectations: ReadonlyArray<{
      variant: BadgeVariant;
      expectedClass: string;
      label: string;
    }> = [
      { variant: "default", expectedClass: "bg-gray-100", label: "default → gray" },
      { variant: "success", expectedClass: "bg-green-100", label: "success → green" },
      { variant: "warning", expectedClass: "bg-yellow-100", label: "warning → yellow" },
      { variant: "destructive", expectedClass: "bg-red-100", label: "destructive → red" },
      {
        variant: "added",
        expectedClass: "bg-diff-added-bg",
        label: "added → diff-added",
      },
      {
        variant: "removed",
        expectedClass: "bg-diff-removed-bg",
        label: "removed → diff-removed",
      },
      {
        variant: "changed",
        expectedClass: "bg-diff-changed-bg",
        label: "changed → diff-changed",
      },
    ];

    for (const { variant, expectedClass, label } of variantExpectations) {
      it(`${label}`, () => {
        render(<Badge variant={variant}>test</Badge>);
        const badge = screen.getByTestId("badge");
        expect(badge.className).toContain(expectedClass);
      });
    }

    const textColorExpectations: ReadonlyArray<{
      variant: BadgeVariant;
      expectedClass: string;
    }> = [
      { variant: "default", expectedClass: "text-gray-700" },
      { variant: "success", expectedClass: "text-green-700" },
      { variant: "warning", expectedClass: "text-yellow-700" },
      { variant: "destructive", expectedClass: "text-red-700" },
      { variant: "added", expectedClass: "text-diff-added-text" },
      { variant: "removed", expectedClass: "text-diff-removed-text" },
      { variant: "changed", expectedClass: "text-diff-changed-text" },
    ];

    for (const { variant, expectedClass } of textColorExpectations) {
      it(`variant="${variant}" のテキスト色クラス: ${expectedClass}`, () => {
        render(<Badge variant={variant}>text</Badge>);
        const badge = screen.getByTestId("badge");
        expect(badge.className).toContain(expectedClass);
      });
    }
  });

  // --- デフォルト variant ---

  describe("デフォルト値", () => {
    it("variant 省略時は default クラスが適用される", () => {
      render(<Badge>no variant</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("bg-gray-100");
      expect(badge.className).toContain("text-gray-700");
    });

    it("size 省略時は default サイズが適用される", () => {
      render(<Badge>no size</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("px-2.5");
      expect(badge.className).toContain("text-sm");
    });
  });

  // --- size ---

  describe("size プロパティ", () => {
    it('size="sm" の場合、小さいパディングとフォントサイズ', () => {
      render(<Badge size="sm">small</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("px-1.5");
      expect(badge.className).toContain("text-xs");
    });

    it('size="default" の場合、標準パディングとフォントサイズ', () => {
      render(<Badge size="default">normal</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("px-2.5");
      expect(badge.className).toContain("text-sm");
    });
  });

  // --- children レンダリング ---

  describe("children レンダリング", () => {
    it("テキスト children が正しくレンダリングされる", () => {
      render(<Badge>Hello Badge</Badge>);
      expect(screen.getByText("Hello Badge")).toBeInTheDocument();
    });

    it("数値 children が正しくレンダリングされる", () => {
      render(<Badge>{42}</Badge>);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("JSX children が正しくレンダリングされる", () => {
      render(
        <Badge>
          <span data-testid="inner">nested</span>
        </Badge>
      );
      expect(screen.getByTestId("inner")).toBeInTheDocument();
      expect(screen.getByText("nested")).toBeInTheDocument();
    });

    it("複合 children（テキスト + 要素）が正しくレンダリングされる", () => {
      render(
        <Badge>
          +3 <span>added</span>
        </Badge>
      );
      expect(screen.getByText("added")).toBeInTheDocument();
    });
  });

  // --- 共通スタイル ---

  describe("共通スタイル", () => {
    it("inline-flex クラスが適用されている", () => {
      render(<Badge>flex</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("inline-flex");
    });

    it("rounded-full クラスが適用されている（ピル型）", () => {
      render(<Badge>pill</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("rounded-full");
    });

    it("font-medium クラスが適用されている", () => {
      render(<Badge>weight</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("font-medium");
    });
  });

  // --- className カスタマイズ ---

  describe("className プロパティ", () => {
    it("追加の className が結合される", () => {
      render(<Badge className="my-custom-class">custom</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.className).toContain("my-custom-class");
      // デフォルトクラスも維持されている
      expect(badge.className).toContain("bg-gray-100");
    });

    it("className 省略時はエラーにならない", () => {
      render(<Badge>no class</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge).toBeInTheDocument();
    });
  });

  // --- HTML要素 ---

  describe("HTML要素", () => {
    it("span 要素としてレンダリングされる", () => {
      render(<Badge>span check</Badge>);
      const badge = screen.getByTestId("badge");
      expect(badge.tagName).toBe("SPAN");
    });
  });
});
