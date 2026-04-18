import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import { ResultSummary } from "./ResultSummary";
import type { ComparisonResult } from "verify-ai";

// compareStore をモック
vi.mock("@/stores/compareStore", () => ({
  useCompareStore: vi.fn((selector) => {
    const state = {
      result: null,
      isComparing: false,
    };
    return selector ? selector(state) : state;
  }),
}));

import { useCompareStore } from "@/stores/compareStore";
const mockUseCompareStore = vi.mocked(useCompareStore);

describe("ResultSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCompareStore.mockImplementation((selector) => {
      const state = {
        result: null,
        isComparing: false,
      };
      return selector ? (selector as (s: typeof state) => unknown)(state) : state;
    });
  });

  // --- 結果なし時の非表示 ---

  describe("結果なしの場合", () => {
    it("result が null の場合コンポーネントが表示されない", () => {
      render(<ResultSummary />);
      // 結果がない場合、サマリー要素が表示されないことを確認
      expect(screen.queryByText(/スコア|score/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/一致|match/i)).not.toBeInTheDocument();
    });
  });

  // --- match 表示 ---

  describe("match 表示", () => {
    it("match: true, diffs: [] の場合「完全一致」が表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/一致/i)).toBeInTheDocument();
    });

    it("match: true, diffs > 0 の場合「部分一致」が表示される", () => {
      const result: ComparisonResult = {
        score: 0.86,
        match: true,
        diffs: [
          { type: "changed", path: "age", sourceValue: "30", targetValue: "31" },
          { type: "changed", path: "city", sourceValue: "大阪", targetValue: "名古屋" },
        ],
        sourceFormat: { type: "csv", confidence: 1.0 },
        targetFormat: { type: "json", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/部分一致/)).toBeInTheDocument();
    });

    it("match: false の場合「不一致」が表示される", () => {
      const result: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [{ type: "changed", path: "row[0]", sourceValue: "a", targetValue: "b" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/不一致/i)).toBeInTheDocument();
    });
  });

  // --- score 表示 ---

  describe("score 表示", () => {
    it("スコアが数値として表示される", () => {
      const result: ComparisonResult = {
        score: 0.85,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/0\.85/)).toBeInTheDocument();
    });

    it("スコア 0.0 が正しく表示される", () => {
      const result: ComparisonResult = {
        score: 0.0,
        match: false,
        diffs: [{ type: "removed", path: "row[0]", sourceValue: "a", targetValue: null }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 0 or 0.0 or 0.00 いずれかが表示される
      expect(screen.getByText(/\b0(\.0+)?\b/)).toBeInTheDocument();
    });

    it("スコア 1.0 が正しく表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/1(\.0+)?/)).toBeInTheDocument();
    });
  });

  // --- 差分カウント表示 ---

  describe("差分カウント表示", () => {
    it("差分がある場合に差分件数が表示される", () => {
      const result: ComparisonResult = {
        score: 0.6,
        match: false,
        diffs: [
          { type: "added", path: "row[0]", sourceValue: null, targetValue: "new" },
          { type: "removed", path: "row[1]", sourceValue: "old", targetValue: null },
          { type: "changed", path: "row[2]", sourceValue: "a", targetValue: "b" },
        ],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 差分件数 3 が表示される
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("差分が0件の場合に0が表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 差分 0 件を表す表示がある
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  // --- 比較中の表示 ---

  describe("比較中の表示", () => {
    it("比較中はローディング表示がある", () => {
      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result: null, isComparing: true };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // ローディングインジケータまたは「比較中」テキストが表示される
      expect(
        screen.getByText(/比較中|loading/i) || screen.getByRole("progressbar")
      ).toBeInTheDocument();
    });
  });

  // --- US3: 一致時の成功表示 ---

  describe("一致時の成功表示（US3）", () => {
    it("match=true, score=1.0, diffs=[] の場合に成功インジケータが表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 完全一致時に成功を示すビジュアルインジケータが存在する
      expect(screen.getByTestId("match-success")).toBeInTheDocument();
    });

    it("match=true の場合に成功を示すアラート/カードが表示される", () => {
      const result: ComparisonResult = {
        score: 0.95,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 成功アラート（role="alert" で severity="success" 相当）
      const successAlert = screen.getByRole("alert");
      expect(successAlert).toBeInTheDocument();
    });

    it("match=false の場合に警告/エラーを示すアラートが表示される", () => {
      const result: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [{ type: "changed", path: "row[0]", sourceValue: "a", targetValue: "b" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 不一致時にも警告アラートが表示される
      const warningAlert = screen.getByRole("alert");
      expect(warningAlert).toBeInTheDocument();
    });

    it("完全一致時にチェックマークアイコンが表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 完全一致時に match-success のテストIDが存在する
      expect(screen.getByTestId("match-success")).toBeInTheDocument();
    });

    it("完全一致時に「完全一致」のテキストが表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // score=1.0 かつ diffs=[] の場合に「完全一致」という明確なメッセージ
      expect(screen.getByText(/完全一致/)).toBeInTheDocument();
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("多数の差分がある結果を正しく表示する", () => {
      const diffs = Array.from({ length: 100 }, (_, i) => ({
        type: "changed" as const,
        path: `row[${i}]`,
        sourceValue: `old${i}`,
        targetValue: `new${i}`,
      }));

      const result: ComparisonResult = {
        score: 0.1,
        match: false,
        diffs,
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 差分件数テキストが表示される
      expect(screen.getByText(/差分件数: 100/)).toBeInTheDocument();
    });
  });

  // ===================================================================
  // Phase 2 (US1): 類似度バッジ + 差分種別バッジ
  // ===================================================================

  // --- 類似度バッジ色分け ---

  describe("類似度バッジ色分け（US1: FR-001）", () => {
    it("score=0.95（95%） → success バッジ（緑）が表示される", () => {
      const result: ComparisonResult = {
        score: 0.95,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // 類似度パーセンテージが表示される
      expect(screen.getByText(/95%/)).toBeInTheDocument();
      // success variant の Badge が使われている（緑系クラス）
      const badges = screen.getAllByTestId("badge");
      const similarityBadge = badges.find((b) => b.textContent?.includes("95%"));
      expect(similarityBadge).toBeDefined();
      expect(similarityBadge!.className).toContain("bg-green-100");
    });

    it("score=0.80（80%） → success バッジ（緑、境界値）", () => {
      const result: ComparisonResult = {
        score: 0.8,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/80%/)).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const similarityBadge = badges.find((b) => b.textContent?.includes("80%"));
      expect(similarityBadge).toBeDefined();
      expect(similarityBadge!.className).toContain("bg-green-100");
    });

    it("score=0.65（65%） → warning バッジ（黄）が表示される", () => {
      const result: ComparisonResult = {
        score: 0.65,
        match: true,
        diffs: [{ type: "changed", path: "a", sourceValue: "x", targetValue: "y" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/65%/)).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const similarityBadge = badges.find((b) => b.textContent?.includes("65%"));
      expect(similarityBadge).toBeDefined();
      expect(similarityBadge!.className).toContain("bg-yellow-100");
    });

    it("score=0.50（50%） → warning バッジ（黄、境界値）", () => {
      const result: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [{ type: "changed", path: "a", sourceValue: "x", targetValue: "y" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/50%/)).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const similarityBadge = badges.find((b) => b.textContent?.includes("50%"));
      expect(similarityBadge).toBeDefined();
      expect(similarityBadge!.className).toContain("bg-yellow-100");
    });

    it("score=0.30（30%） → destructive バッジ（赤）が表示される", () => {
      const result: ComparisonResult = {
        score: 0.3,
        match: false,
        diffs: [
          { type: "removed", path: "a", sourceValue: "x", targetValue: null },
          { type: "removed", path: "b", sourceValue: "y", targetValue: null },
        ],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/30%/)).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const similarityBadge = badges.find((b) => b.textContent?.includes("30%"));
      expect(similarityBadge).toBeDefined();
      expect(similarityBadge!.className).toContain("bg-red-100");
    });

    it("score=0.0（0%） → destructive バッジ（赤）", () => {
      const result: ComparisonResult = {
        score: 0.0,
        match: false,
        diffs: [{ type: "removed", path: "a", sourceValue: "x", targetValue: null }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/0%/)).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const similarityBadge = badges.find((b) => b.textContent?.includes("0%"));
      expect(similarityBadge).toBeDefined();
      expect(similarityBadge!.className).toContain("bg-red-100");
    });
  });

  // --- 差分種別バッジ横並び ---

  describe("差分種別バッジ横並び（US1: FR-002）", () => {
    it("added バッジに +N 形式で件数が表示される", () => {
      const result: ComparisonResult = {
        score: 0.7,
        match: false,
        diffs: [
          { type: "added", path: "a", sourceValue: null, targetValue: "new1" },
          { type: "added", path: "b", sourceValue: null, targetValue: "new2" },
          { type: "removed", path: "c", sourceValue: "old", targetValue: null },
        ],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // +2 の added バッジ
      expect(screen.getByText(/\+2/)).toBeInTheDocument();
    });

    it("removed バッジに -N 形式で件数が表示される", () => {
      const result: ComparisonResult = {
        score: 0.6,
        match: false,
        diffs: [
          { type: "removed", path: "a", sourceValue: "x", targetValue: null },
          { type: "removed", path: "b", sourceValue: "y", targetValue: null },
          { type: "removed", path: "c", sourceValue: "z", targetValue: null },
        ],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // -3 の removed バッジ
      expect(screen.getByText(/-3/)).toBeInTheDocument();
    });

    it("changed バッジに ~N 形式で件数が表示される", () => {
      const result: ComparisonResult = {
        score: 0.8,
        match: true,
        diffs: [{ type: "changed", path: "a", sourceValue: "x", targetValue: "y" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // ~1 の changed バッジ
      expect(screen.getByText(/~1/)).toBeInTheDocument();
    });

    it("added/removed/changed が混在する場合、3種のバッジが全て表示される", () => {
      const result: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [
          { type: "added", path: "a", sourceValue: null, targetValue: "new" },
          { type: "removed", path: "b", sourceValue: "old", targetValue: null },
          { type: "changed", path: "c", sourceValue: "x", targetValue: "y" },
        ],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/\+1/)).toBeInTheDocument();
      expect(screen.getByText(/-1/)).toBeInTheDocument();
      expect(screen.getByText(/~1/)).toBeInTheDocument();
    });

    it("added バッジは added variant のクラスを持つ", () => {
      const result: ComparisonResult = {
        score: 0.7,
        match: false,
        diffs: [{ type: "added", path: "a", sourceValue: null, targetValue: "new" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      const badges = screen.getAllByTestId("badge");
      const addedBadge = badges.find((b) => b.textContent?.includes("+1"));
      expect(addedBadge).toBeDefined();
      expect(addedBadge!.className).toContain("bg-diff-added-bg");
    });

    it("removed バッジは removed variant のクラスを持つ", () => {
      const result: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [{ type: "removed", path: "a", sourceValue: "x", targetValue: null }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      const badges = screen.getAllByTestId("badge");
      const removedBadge = badges.find((b) => b.textContent?.includes("-1"));
      expect(removedBadge).toBeDefined();
      expect(removedBadge!.className).toContain("bg-diff-removed-bg");
    });

    it("changed バッジは changed variant のクラスを持つ", () => {
      const result: ComparisonResult = {
        score: 0.6,
        match: false,
        diffs: [{ type: "changed", path: "a", sourceValue: "x", targetValue: "y" }],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      const badges = screen.getAllByTestId("badge");
      const changedBadge = badges.find((b) => b.textContent?.includes("~1"));
      expect(changedBadge).toBeDefined();
      expect(changedBadge!.className).toContain("bg-diff-changed-bg");
    });
  });

  // --- 完全一致時の表示 ---

  describe("完全一致時のバッジ表示（US1）", () => {
    it("score=1.0, diffs=[] → 100% 緑バッジが表示される", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/100%/)).toBeInTheDocument();
      const badges = screen.getAllByTestId("badge");
      const perfectBadge = badges.find((b) => b.textContent?.includes("100%"));
      expect(perfectBadge).toBeDefined();
      expect(perfectBadge!.className).toContain("bg-green-100");
    });

    it("完全一致時、差分種別バッジは表示されない（または全て0件）", () => {
      const result: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };

      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result, isComparing: false };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      // +N, -N, ~N のバッジが表示されない
      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
      expect(screen.queryByText(/-\d+/)).not.toBeInTheDocument();
      expect(screen.queryByText(/~\d+/)).not.toBeInTheDocument();
    });
  });

  // --- 比較中のスピナー表示（Badge との共存確認） ---

  describe("比較中のスピナー表示（US1 拡張）", () => {
    it("比較中はバッジが表示されずスピナーのみ表示される", () => {
      mockUseCompareStore.mockImplementation((selector) => {
        const state = { result: null, isComparing: true };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<ResultSummary />);
      expect(screen.getByText(/比較中/)).toBeInTheDocument();
      // バッジは表示されない
      expect(screen.queryAllByTestId("badge")).toHaveLength(0);
    });
  });
});
