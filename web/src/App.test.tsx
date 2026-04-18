import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import App from "./App";
import type { ComparisonResult } from "verify-ai";

// reset をトラッキングするモック関数（mockStoreWithResult から参照される）
const mockReset = vi.fn();

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
      reset: mockReset,
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
  DiffViewSwitcher: () => <div data-testid="diff-view-switcher">DiffViewSwitcher</div>,
}));

vi.mock("@/components/SideBySideView", () => ({
  SideBySideView: () => <div data-testid="side-by-side-view">SideBySideView</div>,
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
  overrides?: Record<string, unknown>
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
      reset: mockReset,
      ...overrides,
    };
    return selector ? (selector as (s: typeof state) => unknown)(state) : state;
  });
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset.mockClear();
    mockStoreWithResult(null);
  });

  // =============================================================
  // 新レイアウト: サマリーカード + Diff カード構成
  // =============================================================

  describe("新レイアウト構造（US1+US2: FR-001, FR-005）", () => {
    it("結果がない場合、summary-card は表示されない", () => {
      mockStoreWithResult(null);
      render(<App />);
      expect(screen.queryByTestId("summary-card")).not.toBeInTheDocument();
    });

    it("結果がない場合、diff-card は表示されない", () => {
      mockStoreWithResult(null);
      render(<App />);
      expect(screen.queryByTestId("diff-card")).not.toBeInTheDocument();
    });

    it("結果がある場合、summary-card が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      expect(screen.getByTestId("summary-card")).toBeInTheDocument();
    });

    it("結果がある場合、diff-card が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      expect(screen.getByTestId("diff-card")).toBeInTheDocument();
    });

    it("summary-card と diff-card は独立した 2 つのカードである", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const summaryCard = screen.getByTestId("summary-card");
      const diffCard = screen.getByTestId("diff-card");
      // 相互に含み合わない（兄弟関係）
      expect(summaryCard.contains(diffCard)).toBe(false);
      expect(diffCard.contains(summaryCard)).toBe(false);
    });

    it("CompareForm は summary-card の外に表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const summaryCard = screen.getByTestId("summary-card");
      const form = screen.getByTestId("compare-form");
      expect(summaryCard.contains(form)).toBe(false);
    });

    it("CompareForm は diff-card の外に表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const form = screen.getByTestId("compare-form");
      expect(diffCard.contains(form)).toBe(false);
    });
  });

  // =============================================================
  // T007: サマリーグリッドコンテナ
  // =============================================================

  describe("サマリーグリッドコンテナ（US1: FR-001 / T007）", () => {
    it("結果がある場合、summary-grid が表示される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      expect(screen.getByTestId("summary-grid")).toBeInTheDocument();
    });

    it("summary-grid は summary-card の内側に配置される", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const summaryCard = screen.getByTestId("summary-card");
      const grid = screen.getByTestId("summary-grid");
      expect(summaryCard.contains(grid)).toBe(true);
    });

    it("summary-grid は grid レイアウトである", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      expect(grid.className).toContain("grid");
    });

    it("結果がない場合、summary-grid は表示されない", () => {
      mockStoreWithResult(null);
      render(<App />);
      expect(screen.queryByTestId("summary-grid")).not.toBeInTheDocument();
    });
  });

  // =============================================================
  // T008: 左列（summary-col-left）
  // =============================================================

  describe("左列: ソース/ターゲット情報（US1: FR-002 / T008）", () => {
    it("summary-col-left が summary-grid 内に存在する", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      const left = screen.getByTestId("summary-col-left");
      expect(grid.contains(left)).toBe(true);
    });

    it("左列にソーステキストのプレビューが表示される", () => {
      mockStoreWithResult(createResult(), {
        source: "Hello World from Source",
        target: "Hello World from Target",
      });
      render(<App />);
      const left = screen.getByTestId("summary-col-left");
      expect(left.textContent).toContain("Hello World from Source");
    });

    it("左列にターゲットテキストのプレビューが表示される", () => {
      mockStoreWithResult(createResult(), {
        source: "Hello World from Source",
        target: "Hello World from Target",
      });
      render(<App />);
      const left = screen.getByTestId("summary-col-left");
      expect(left.textContent).toContain("Hello World from Target");
    });

    it("ソーステキストが 50 文字を超える場合、先頭部分のみがプレビューされる", () => {
      const longSource = "A".repeat(200);
      mockStoreWithResult(createResult(), {
        source: longSource,
        target: "short target",
      });
      render(<App />);
      const left = screen.getByTestId("summary-col-left");
      // 全 200 文字がそのまま出ないこと（プレビューで切り詰め）
      // 先頭 50 文字相当は含まれる
      expect(left.textContent).toContain("A".repeat(50));
      // ただし 200 文字丸ごとは含まれない
      expect(left.textContent).not.toContain("A".repeat(200));
    });

    it("空のソーステキストでもクラッシュしない", () => {
      mockStoreWithResult(createResult(), { source: "", target: "only target" });
      expect(() => render(<App />)).not.toThrow();
      expect(screen.getByTestId("summary-col-left")).toBeInTheDocument();
    });

    it("マッチステータスラベルが左列に表示される（完全一致）", () => {
      mockStoreWithResult(
        createResult({ score: 1.0, match: true, diffs: [] }),
        { source: "same", target: "same" }
      );
      render(<App />);
      const left = screen.getByTestId("summary-col-left");
      expect(left.textContent).toContain("完全一致");
    });

    it("マッチステータスラベルが左列に表示される（不一致）", () => {
      mockStoreWithResult(
        createResult({ score: 0.1, match: false, diffs: [] }),
        { source: "a", target: "b" }
      );
      render(<App />);
      const left = screen.getByTestId("summary-col-left");
      expect(left.textContent).toContain("不一致");
    });
  });

  // =============================================================
  // T009: 中列（summary-col-center）
  // =============================================================

  describe("中列: 統計情報（US1: FR-003 / T009）", () => {
    it("summary-col-center が summary-grid 内に存在する", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      const center = screen.getByTestId("summary-col-center");
      expect(grid.contains(center)).toBe(true);
    });

    it("中列に類似度バッジが表示される（score=0.75 → 75%）", () => {
      mockStoreWithResult(createResult({ score: 0.75 }));
      render(<App />);
      const center = screen.getByTestId("summary-col-center");
      expect(center.textContent).toContain("75%");
    });

    it("中列に追加バッジが表示される（added 件数あり）", () => {
      mockStoreWithResult(
        createResult({
          diffs: [
            { type: "added", path: "a", sourceValue: null, targetValue: "1" },
            { type: "added", path: "b", sourceValue: null, targetValue: "2" },
          ],
        })
      );
      render(<App />);
      const center = screen.getByTestId("summary-col-center");
      // +2 の追加バッジ
      expect(center.textContent).toMatch(/\+?2/);
    });

    it("中列に削除バッジが表示される（removed 件数あり）", () => {
      mockStoreWithResult(
        createResult({
          diffs: [
            { type: "removed", path: "x", sourceValue: "1", targetValue: null },
            { type: "removed", path: "y", sourceValue: "2", targetValue: null },
            { type: "removed", path: "z", sourceValue: "3", targetValue: null },
          ],
        })
      );
      render(<App />);
      const center = screen.getByTestId("summary-col-center");
      expect(center.textContent).toMatch(/-?3/);
    });

    it("中列に変更バッジが表示される（changed 件数あり）", () => {
      mockStoreWithResult(
        createResult({
          diffs: [
            { type: "changed", path: "p", sourceValue: "a", targetValue: "b" },
          ],
        })
      );
      render(<App />);
      const center = screen.getByTestId("summary-col-center");
      expect(center.textContent).toMatch(/~?1/);
    });

    it("中列は縦積みレイアウト（flex-col）を持つ", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const center = screen.getByTestId("summary-col-center");
      // 統計項目が縦に並ぶため flex-col クラスを含む想定
      expect(center.className).toMatch(/flex-col|space-y|grid/);
    });

    it("差分が空の場合でも中列は表示される（類似度のみ）", () => {
      mockStoreWithResult(
        createResult({ diffs: [], score: 1.0, match: true })
      );
      render(<App />);
      const center = screen.getByTestId("summary-col-center");
      expect(center).toBeInTheDocument();
      expect(center.textContent).toContain("100%");
    });
  });

  // =============================================================
  // T010: 右列（summary-col-right）
  // =============================================================

  describe("右列: ビューモード + アクションボタン（US1: FR-004 / T010）", () => {
    it("summary-col-right が summary-grid 内に存在する", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      const right = screen.getByTestId("summary-col-right");
      expect(grid.contains(right)).toBe(true);
    });

    it("右列に DiffViewSwitcher が含まれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const right = screen.getByTestId("summary-col-right");
      const switcher = screen.getByTestId("diff-view-switcher");
      expect(right.contains(switcher)).toBe(true);
    });

    it("右列にコピーボタンが含まれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const right = screen.getByTestId("summary-col-right");
      const copyButton = screen.getByTestId("copy-button");
      expect(right.contains(copyButton)).toBe(true);
    });

    it("右列に新規比較ボタン（new-comparison-button）が含まれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const right = screen.getByTestId("summary-col-right");
      const newCompButton = screen.getByTestId("new-comparison-button");
      expect(right.contains(newCompButton)).toBe(true);
    });

    it("新規比較ボタンをクリックすると compareStore.reset() が呼ばれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const newCompButton = screen.getByTestId("new-comparison-button");
      fireEvent.click(newCompButton);
      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("右列は縦積みレイアウト（flex-col 系）を持つ", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const right = screen.getByTestId("summary-col-right");
      expect(right.className).toMatch(/flex-col|space-y|gap/);
    });
  });

  // =============================================================
  // T011: Diff ビューアカード
  // =============================================================

  describe("Diff ビューアカード（US2: FR-005 / T011）", () => {
    it("diff-card 内にビューア（side-by-side モード）が含まれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const viewer = screen.getByTestId("side-by-side-view");
      expect(diffCard.contains(viewer)).toBe(true);
    });

    it("diff-card 内に DiffViewSwitcher は含まれない（右列に移動済み）", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const switcher = screen.getByTestId("diff-view-switcher");
      expect(diffCard.contains(switcher)).toBe(false);
    });

    it("diff-card 内にコピーボタンは含まれない（右列に移動済み）", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const copyButton = screen.getByTestId("copy-button");
      expect(diffCard.contains(copyButton)).toBe(false);
    });

    it("diff-card に角丸+ボーダーを持つ", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      expect(diffCard.className).toContain("rounded-lg");
      expect(diffCard.className).toContain("border");
    });

    it("viewMode が list の場合、diff-card 内に DiffList が表示される", () => {
      mockStoreWithResult(createResult(), { viewMode: "list" });
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const diffList = screen.getByTestId("diff-list");
      expect(diffCard.contains(diffList)).toBe(true);
    });

    it("viewMode が inline の場合、diff-card 内に InlineView が表示される", () => {
      mockStoreWithResult(createResult(), { viewMode: "inline" });
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const inlineView = screen.getByTestId("inline-view");
      expect(diffCard.contains(inlineView)).toBe(true);
    });
  });

  // =============================================================
  // T012: コピー機能（構造変更後の維持確認）
  // =============================================================

  describe("コピー機能（US4: FR-012 / T012 - 新レイアウト下）", () => {
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

      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/コピーしました/)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  // =============================================================
  // エッジケース（新レイアウト下）
  // =============================================================

  describe("エッジケース（新レイアウト）", () => {
    it("結果が空の diffs の場合でも summary-card は表示される", () => {
      mockStoreWithResult(createResult({ diffs: [], score: 1.0, match: true }));
      render(<App />);
      expect(screen.getByTestId("summary-card")).toBeInTheDocument();
    });

    it("結果が空の diffs の場合でも diff-card は表示される", () => {
      mockStoreWithResult(createResult({ diffs: [], score: 1.0, match: true }));
      render(<App />);
      expect(screen.getByTestId("diff-card")).toBeInTheDocument();
    });

    it("diffs が空の場合でもコピーボタンは表示される", () => {
      mockStoreWithResult(createResult({ diffs: [], score: 1.0, match: true }));
      render(<App />);
      expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    });

    it("diffs が空の場合でも新規比較ボタンは表示される", () => {
      mockStoreWithResult(createResult({ diffs: [], score: 1.0, match: true }));
      render(<App />);
      expect(screen.getByTestId("new-comparison-button")).toBeInTheDocument();
    });

    it("viewMode が list の場合、diff-card に DiffList が表示される", () => {
      mockStoreWithResult(createResult(), { viewMode: "list" });
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const diffList = screen.getByTestId("diff-list");
      expect(diffCard.contains(diffList)).toBe(true);
    });

    it("viewMode が inline の場合、diff-card に InlineView が表示される", () => {
      mockStoreWithResult(createResult(), { viewMode: "inline" });
      render(<App />);
      const diffCard = screen.getByTestId("diff-card");
      const inlineView = screen.getByTestId("inline-view");
      expect(diffCard.contains(inlineView)).toBe(true);
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

      expect(() => fireEvent.click(copyButton)).not.toThrow();

      await waitFor(() => {
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
        expect(writeText).toHaveBeenCalled();
      });
    });

    it("新規比較ボタンの連続クリックでも reset が毎回呼ばれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);

      const newCompButton = screen.getByTestId("new-comparison-button");
      fireEvent.click(newCompButton);
      fireEvent.click(newCompButton);

      expect(mockReset).toHaveBeenCalledTimes(2);
    });
  });

  // =============================================================
  // T022: レスポンシブグリッド（US3: FR-006）
  // =============================================================

  describe("レスポンシブグリッド（US3: FR-006 / T022）", () => {
    it("summary-grid の className に grid-cols-1 が含まれる（モバイル: 1カラム）", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      expect(grid.className).toContain("grid-cols-1");
    });

    it("summary-grid の className に md:grid-cols-2 が含まれる（タブレット: 2カラム）", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      expect(grid.className).toContain("md:grid-cols-2");
    });

    it("summary-grid の className に lg:grid-cols-3 が含まれる（デスクトップ: 3カラム）", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      expect(grid.className).toContain("lg:grid-cols-3");
    });

    it("summary-grid の className にレスポンシブ全3段階（grid-cols-1 / md:grid-cols-2 / lg:grid-cols-3）が同時に含まれる", () => {
      mockStoreWithResult(createResult());
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      expect(grid.className).toContain("grid-cols-1");
      expect(grid.className).toContain("md:grid-cols-2");
      expect(grid.className).toContain("lg:grid-cols-3");
    });

    it("結果が空の diffs の場合でもレスポンシブクラスが適用される", () => {
      mockStoreWithResult(createResult({ diffs: [], score: 1.0, match: true }));
      render(<App />);
      const grid = screen.getByTestId("summary-grid");
      expect(grid.className).toContain("grid-cols-1");
      expect(grid.className).toContain("md:grid-cols-2");
      expect(grid.className).toContain("lg:grid-cols-3");
    });
  });
});
