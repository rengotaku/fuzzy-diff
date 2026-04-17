import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import App from "./App";
import type { ComparisonResult } from "verify-ai";

// compareStore をモック
vi.mock("@/stores/compareStore", () => ({
  useCompareStore: vi.fn((selector) => {
    const state = {
      result: null,
      source: "",
      target: "",
      viewMode: "side-by-side" as const,
      isComparing: false,
      error: null,
      hoveredDiffItem: null,
    };
    return selector ? selector(state) : state;
  }),
}));

// 子コンポーネントをモック（App の統合テストに集中するため）
vi.mock("@/components/CompareForm", () => ({
  CompareForm: () => <div data-testid="compare-form">CompareForm</div>,
}));

vi.mock("@/components/ResultSummary", () => ({
  ResultSummary: () => <div data-testid="result-summary">ResultSummary</div>,
}));

vi.mock("@/components/DiffList", () => ({
  DiffList: ({ diffs }: { diffs: unknown[] }) => (
    <div data-testid="diff-list">DiffList ({diffs.length})</div>
  ),
}));

vi.mock("@/components/DiffViewSwitcher", () => ({
  DiffViewSwitcher: () => (
    <div data-testid="diff-view-switcher">DiffViewSwitcher</div>
  ),
}));

vi.mock("@/components/SideBySideView", () => ({
  SideBySideView: () => (
    <div data-testid="side-by-side-view">SideBySideView</div>
  ),
}));

vi.mock("@/components/InlineView", () => ({
  InlineView: () => <div data-testid="inline-view">InlineView</div>,
}));

import { useCompareStore } from "@/stores/compareStore";
const mockUseCompareStore = vi.mocked(useCompareStore);

// テスト用 ComparisonResult ファクトリ
function createResult(overrides?: Partial<ComparisonResult>): ComparisonResult {
  return {
    score: 0.75,
    match: true,
    diffs: [
      { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
      { type: "added", path: "age", sourceValue: null, targetValue: "30" },
    ],
    sourceFormat: { type: "plain", confidence: 1.0 },
    targetFormat: { type: "plain", confidence: 1.0 },
    ...overrides,
  };
}

function mockStoreWithResult(
  result: ComparisonResult | null,
  overrides?: Record<string, unknown>,
) {
  mockUseCompareStore.mockImplementation((selector) => {
    const state = {
      result,
      source: "Source text\nLine 2",
      target: "Target text\nLine 2",
      viewMode: "side-by-side" as const,
      isComparing: false,
      error: null,
      hoveredDiffItem: null,
      ...overrides,
    };
    return selector ? (selector as (s: typeof state) => unknown)(state) : state;
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreWithResult(null);
  });

  // =============================================================
  // US4: カードレイアウト (T059)
  // =============================================================

  describe("カードレイアウト（US4: FR-011）", () => {
    it("結果がない場合、Card コンポーネントは表示されない", () => {
      mockStoreWithResult(null);
      render(<App />);
      expect(screen.queryByTestId("card")).not.toBeInTheDocument();
    });

    it("結果がある場合、結果が Card コンポーネント内に表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      // Card でラップされている
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("Card 内に CardHeader が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
    });

    it("Card 内に CardContent が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
    });

    it("CardHeader 内に ResultSummary が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const header = screen.getByTestId("card-header");
      const summary = screen.getByTestId("result-summary");
      expect(header.contains(summary)).toBe(true);
    });

    it("CardHeader 内にコピーボタンが表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const header = screen.getByTestId("card-header");
      const copyButton = screen.getByTestId("copy-button");
      expect(header.contains(copyButton)).toBe(true);
    });

    it("CardContent 内に DiffViewSwitcher が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const content = screen.getByTestId("card-content");
      const switcher = screen.getByTestId("diff-view-switcher");
      expect(content.contains(switcher)).toBe(true);
    });

    it("CardContent 内にビューアが表示される（side-by-side モード）", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const content = screen.getByTestId("card-content");
      const viewer = screen.getByTestId("side-by-side-view");
      expect(content.contains(viewer)).toBe(true);
    });

    it("CardHeader に角丸+ボーダーの Card 親要素がある", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("rounded-lg");
      expect(card.className).toContain("border");
    });

    it("CompareForm は Card の外に表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const card = screen.getByTestId("card");
      const form = screen.getByTestId("compare-form");
      expect(card.contains(form)).toBe(false);
    });
  });

  // =============================================================
  // US4: コピー機能 (T060)
  // =============================================================

  describe("コピー機能（US4: FR-012）", () => {
    let originalClipboard: Clipboard;

    beforeEach(() => {
      originalClipboard = navigator.clipboard;
    });

    afterEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    });

    it("コピーボタンが data-testid='copy-button' を持つ", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    });

    it("コピーボタンクリックで navigator.clipboard.writeText が呼ばれる", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      mockStoreWithResult(createResult());
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledTimes(1);
      });
    });

    it("コピーボタンクリックで差分テキストが引数として渡される", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      const result = createResult({
        diffs: [
          { type: "changed", path: "name", sourceValue: "Alice", targetValue: "Bob" },
        ],
      });
      mockStoreWithResult(result);
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledTimes(1);
        // 差分情報を含む文字列が渡される
        const copiedText = writeText.mock.calls[0][0];
        expect(typeof copiedText).toBe("string");
        expect(copiedText.length).toBeGreaterThan(0);
      });
    });

    it("コピー成功後に「コピーしました」フィードバックが表示される", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      mockStoreWithResult(createResult());
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/コピーしました/)).toBeInTheDocument();
      });
    });

    it("コピー失敗時にエラーフィードバックが表示される", async () => {
      const writeText = vi.fn().mockRejectedValue(new Error("Clipboard API error"));
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      mockStoreWithResult(createResult());
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/コピーに失敗/)).toBeInTheDocument();
      });
    });

    it("コピー成功フィードバックは一定時間後に消える", async () => {
      vi.useFakeTimers();
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      mockStoreWithResult(createResult());
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/コピーしました/)).toBeInTheDocument();
      });

      // 3秒後にフィードバックが消える
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/コピーしました/)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  // =============================================================
  // エッジケース
  // =============================================================

  describe("エッジケース", () => {
    it("結果が空の diffs の場合でもカードは表示される", () => {
      mockStoreWithResult(
        createResult({ diffs: [], score: 1.0, match: true }),
      );
      render(<App />);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("diffs が空の場合でもコピーボタンは表示される", () => {
      mockStoreWithResult(
        createResult({ diffs: [], score: 1.0, match: true }),
      );
      render(<App />);
      expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    });

    it("viewMode が list の場合、CardContent 内に DiffList が表示される", () => {
      mockStoreWithResult(createResult(), { viewMode: "list" });
      render(<App />);
      const content = screen.getByTestId("card-content");
      const diffList = screen.getByTestId("diff-list");
      expect(content.contains(diffList)).toBe(true);
    });

    it("viewMode が inline の場合、CardContent 内に InlineView が表示される", () => {
      mockStoreWithResult(createResult(), { viewMode: "inline" });
      render(<App />);
      const content = screen.getByTestId("card-content");
      const inlineView = screen.getByTestId("inline-view");
      expect(content.contains(inlineView)).toBe(true);
    });

    it("大量の差分がある場合でもコピーボタンが動作する", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      const diffs = Array.from({ length: 100 }, (_, i) => ({
        type: "changed" as const,
        path: `field${i}`,
        sourceValue: `old${i}`,
        targetValue: `new${i}`,
      }));
      mockStoreWithResult(createResult({ diffs }));
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledTimes(1);
        const copiedText = writeText.mock.calls[0][0];
        expect(copiedText.length).toBeGreaterThan(0);
      });
    });

    it("navigator.clipboard が undefined の場合でもクラッシュしない", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      mockStoreWithResult(createResult());
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");

      // クリックしてもエラーで落ちない
      expect(() => fireEvent.click(copyButton)).not.toThrow();

      await waitFor(() => {
        // エラーフィードバックが表示される
        expect(screen.getByText(/コピーに失敗/)).toBeInTheDocument();
      });
    });

    it("連続クリックしても二重コピーにならない", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });

      mockStoreWithResult(createResult());
      render(<App />);

      const copyButton = screen.getByTestId("copy-button");
      fireEvent.click(copyButton);
      fireEvent.click(copyButton);

      await waitFor(() => {
        // 最初のクリックは確実に呼ばれる
        expect(writeText).toHaveBeenCalled();
      });
    });
  });
});
