import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { Button } from "./Button";

describe("Button", () => {
  // --- デフォルトレンダリング ---

  describe("デフォルトレンダリング", () => {
    it("children がレンダリングされる", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("デフォルトで primary variant のクラスが適用される", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-blue-600");
      expect(button.className).toContain("text-white");
    });

    it("デフォルトで default size のクラスが適用される", () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("py-2");
    });

    it("button 要素としてレンダリングされる", () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole("button");
      expect(button.tagName.toLowerCase()).toBe("button");
    });
  });

  // --- variant 別スタイル ---

  describe("variant 別スタイル", () => {
    it("primary variant は青い背景と白いテキスト", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-blue-600");
      expect(button.className).toContain("text-white");
    });

    it("secondary variant はグレー背景", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("bg-gray-100");
      expect(button.className).toContain("text-gray-700");
    });

    it("ghost variant はテキストのみ（静的背景なし）", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("text-gray-700");
      expect(button.className).not.toContain("bg-blue-600");
      // ghost は hover:bg-gray-100 を持つが、静的な bg-gray-100 は持たない
      // クラスを分割して静的な bg-gray-100 がないことを確認
      const classes = button.className.split(/\s+/);
      expect(classes).not.toContain("bg-gray-100");
    });

    it("icon variant は丸い形で p-2 のパディング", () => {
      render(<Button variant="icon">X</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("rounded-full");
      expect(button.className).toContain("p-2");
    });

    it("icon variant では size クラスが適用されない", () => {
      render(
        <Button variant="icon" size="lg">
          X
        </Button>
      );
      const button = screen.getByRole("button");
      // icon variant では sizeClasses を適用しない
      expect(button.className).not.toContain("px-6");
      expect(button.className).not.toContain("py-3");
    });
  });

  // --- size 別スタイル ---

  describe("size 別スタイル", () => {
    it("sm サイズは小さいパディングとテキスト", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-3");
      expect(button.className).toContain("py-1.5");
      expect(button.className).toContain("text-sm");
    });

    it("default サイズは標準パディング", () => {
      render(<Button size="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-4");
      expect(button.className).toContain("py-2");
    });

    it("lg サイズは大きいパディングとテキスト", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("px-6");
      expect(button.className).toContain("py-3");
      expect(button.className).toContain("text-base");
    });
  });

  // --- disabled 状態 ---

  describe("disabled 状態", () => {
    it("disabled=true のとき button が無効化される", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("disabled=true のとき opacity クラスが適用される", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("disabled:opacity-50");
    });

    it("disabled=false のとき button が有効である", () => {
      render(<Button disabled={false}>Enabled</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  // --- カスタム className ---

  describe("カスタム className", () => {
    it("追加の className が button に適用される", () => {
      render(<Button className="mt-4 custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("mt-4");
      expect(button.className).toContain("custom-class");
    });

    it("カスタム className がデフォルトクラスを上書きしない", () => {
      render(<Button className="extra">Test</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("inline-flex");
      expect(button.className).toContain("extra");
    });
  });

  // --- onClick ハンドラ ---

  describe("onClick ハンドラ", () => {
    it("クリック時に onClick コールバックが呼ばれる", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled 時にクリックしても onClick が呼ばれない", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // --- 共通スタイル ---

  describe("共通スタイル", () => {
    it("全 variant で transition クラスが適用される", () => {
      render(<Button>Transition</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("transition-all");
    });

    it("全 variant で focus:outline-none が適用される", () => {
      render(<Button>Focus</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("focus:outline-none");
    });

    it("inline-flex で中央揃えされる", () => {
      render(<Button>Flex</Button>);
      const button = screen.getByRole("button");
      expect(button.className).toContain("inline-flex");
      expect(button.className).toContain("items-center");
      expect(button.className).toContain("justify-center");
    });
  });

  // --- HTML 属性の透過 ---

  describe("HTML 属性の透過", () => {
    it("type 属性が透過される", () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("aria-label 属性が透過される", () => {
      render(<Button aria-label="custom label">Aria</Button>);
      const button = screen.getByRole("button", { name: "custom label" });
      expect(button).toBeInTheDocument();
    });

    it("data-testid 属性が透過される", () => {
      render(<Button data-testid="my-button">Test</Button>);
      expect(screen.getByTestId("my-button")).toBeInTheDocument();
    });
  });
});
