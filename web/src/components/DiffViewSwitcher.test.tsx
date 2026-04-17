import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { DiffViewSwitcher } from "./DiffViewSwitcher";
import { useCompareStore } from "@/stores/compareStore";
import type { DiffViewMode } from "@/utils/highlightMapper";

describe("DiffViewSwitcher", () => {
  beforeEach(() => {
    // ストアをリセットしてデフォルト状態にする
    useCompareStore.getState().reset();
  });

  // --- ラッパー要素 ---

  describe("ラッパー要素", () => {
    it("data-testid='diff-view-switcher' がラッパー div に付与されている", () => {
      render(<DiffViewSwitcher />);
      const wrapper = screen.getByTestId("diff-view-switcher");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute("role", "group");
    });
  });

  // --- アイコン表示（US5: FR-010） ---

  describe("アイコン表示", () => {
    it("リストボタンに SVG アイコン (data-testid='icon-list') が表示される", () => {
      render(<DiffViewSwitcher />);
      const icon = screen.getByTestId("icon-list");
      expect(icon).toBeInTheDocument();
      // SVG 要素であること
      expect(icon.tagName.toLowerCase()).toBe("svg");
    });

    it("side-by-side ボタンに SVG アイコン (data-testid='icon-side-by-side') が表示される", () => {
      render(<DiffViewSwitcher />);
      const icon = screen.getByTestId("icon-side-by-side");
      expect(icon).toBeInTheDocument();
      expect(icon.tagName.toLowerCase()).toBe("svg");
    });

    it("インラインボタンに SVG アイコン (data-testid='icon-inline') が表示される", () => {
      render(<DiffViewSwitcher />);
      const icon = screen.getByTestId("icon-inline");
      expect(icon).toBeInTheDocument();
      expect(icon.tagName.toLowerCase()).toBe("svg");
    });

    it("各ボタンにアイコンとラベルテキストの両方が含まれる", () => {
      render(<DiffViewSwitcher />);
      const listButton = screen.getByRole("button", { name: /リスト/i });
      expect(listButton.querySelector("svg")).not.toBeNull();
      expect(listButton).toHaveTextContent("リスト");

      const sideButton = screen.getByRole("button", { name: /side-by-side/i });
      expect(sideButton.querySelector("svg")).not.toBeNull();
      expect(sideButton).toHaveTextContent("side-by-side");

      const inlineButton = screen.getByRole("button", { name: /インライン/i });
      expect(inlineButton.querySelector("svg")).not.toBeNull();
      expect(inlineButton).toHaveTextContent("インライン");
    });
  });

  // --- 3つのビューモード表示 ---

  describe("ビューモード表示", () => {
    it("3つのビューモードボタンが表示される", () => {
      render(<DiffViewSwitcher />);
      expect(screen.getByRole("button", { name: /リスト/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /side-by-side/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /インライン/i })).toBeInTheDocument();
    });

    it("list ボタンが存在する", () => {
      render(<DiffViewSwitcher />);
      const listButton = screen.getByRole("button", { name: /リスト/i });
      expect(listButton).toBeInTheDocument();
    });

    it("side-by-side ボタンが存在する", () => {
      render(<DiffViewSwitcher />);
      const sideBySideButton = screen.getByRole("button", { name: /side-by-side/i });
      expect(sideBySideButton).toBeInTheDocument();
    });

    it("inline ボタンが存在する", () => {
      render(<DiffViewSwitcher />);
      const inlineButton = screen.getByRole("button", { name: /インライン/i });
      expect(inlineButton).toBeInTheDocument();
    });
  });

  // --- デフォルト選択 ---

  describe("デフォルト選択", () => {
    it("デフォルトで side-by-side が選択されている", () => {
      render(<DiffViewSwitcher />);
      const sideBySideButton = screen.getByRole("button", { name: /side-by-side/i });
      // MUI ToggleButtonGroup では選択状態に aria-pressed="true" が付く
      expect(sideBySideButton).toHaveAttribute("aria-pressed", "true");
    });

    it("デフォルトで list は選択されていない", () => {
      render(<DiffViewSwitcher />);
      const listButton = screen.getByRole("button", { name: /リスト/i });
      expect(listButton).toHaveAttribute("aria-pressed", "false");
    });

    it("デフォルトで inline は選択されていない", () => {
      render(<DiffViewSwitcher />);
      const inlineButton = screen.getByRole("button", { name: /インライン/i });
      expect(inlineButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  // --- クリックによる切替 ---

  describe("クリックによるモード切替", () => {
    it("list をクリックすると viewMode が list に変わる", () => {
      render(<DiffViewSwitcher />);
      const listButton = screen.getByRole("button", { name: /リスト/i });
      fireEvent.click(listButton);
      expect(useCompareStore.getState().viewMode).toBe("list");
    });

    it("inline をクリックすると viewMode が inline に変わる", () => {
      render(<DiffViewSwitcher />);
      const inlineButton = screen.getByRole("button", { name: /インライン/i });
      fireEvent.click(inlineButton);
      expect(useCompareStore.getState().viewMode).toBe("inline");
    });

    it("side-by-side をクリックすると viewMode が side-by-side に変わる", () => {
      // まず別のモードに切替
      useCompareStore.getState().setViewMode("list");
      render(<DiffViewSwitcher />);
      const sideBySideButton = screen.getByRole("button", { name: /side-by-side/i });
      fireEvent.click(sideBySideButton);
      expect(useCompareStore.getState().viewMode).toBe("side-by-side");
    });

    it("切替後に選択ボタンの aria-pressed が更新される", () => {
      render(<DiffViewSwitcher />);
      const listButton = screen.getByRole("button", { name: /リスト/i });
      fireEvent.click(listButton);
      expect(listButton).toHaveAttribute("aria-pressed", "true");
      const sideBySideButton = screen.getByRole("button", { name: /side-by-side/i });
      expect(sideBySideButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  // --- ストア連携 ---

  describe("ストア連携", () => {
    it("ストアの viewMode が変更されると選択状態が反映される", () => {
      useCompareStore.getState().setViewMode("inline");
      render(<DiffViewSwitcher />);
      const inlineButton = screen.getByRole("button", { name: /インライン/i });
      expect(inlineButton).toHaveAttribute("aria-pressed", "true");
    });

    it("リセット後にデフォルトの side-by-side に戻る", () => {
      useCompareStore.getState().setViewMode("list");
      useCompareStore.getState().reset();
      render(<DiffViewSwitcher />);
      const sideBySideButton = screen.getByRole("button", { name: /side-by-side/i });
      expect(sideBySideButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("同じモードを連続クリックしても viewMode が維持される", () => {
      render(<DiffViewSwitcher />);
      const sideBySideButton = screen.getByRole("button", { name: /side-by-side/i });
      fireEvent.click(sideBySideButton);
      // 同じボタンを再度クリック - viewMode は変わらない (null にならない)
      expect(useCompareStore.getState().viewMode).toBe("side-by-side");
    });

    it("全モードを順番に切替できる", () => {
      render(<DiffViewSwitcher />);
      const modes: DiffViewMode[] = ["list", "inline", "side-by-side"];
      const labels = [/リスト/i, /インライン/i, /side-by-side/i];

      for (let i = 0; i < modes.length; i++) {
        const button = screen.getByRole("button", { name: labels[i] });
        fireEvent.click(button);
        expect(useCompareStore.getState().viewMode).toBe(modes[i]);
      }
    });
  });
});
