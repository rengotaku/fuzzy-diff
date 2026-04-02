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
      const { container } = render(<ResultSummary />);
      // 結果がない場合、サマリー要素が表示されないことを確認
      expect(screen.queryByText(/スコア|score/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/一致|match/i)).not.toBeInTheDocument();
    });
  });

  // --- match 表示 ---

  describe("match 表示", () => {
    it("match: true の場合「一致」が表示される", () => {
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

    it("match: false の場合「不一致」が表示される", () => {
      const result: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [
          { type: "changed", path: "row[0]", sourceValue: "a", targetValue: "b" },
        ],
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
        diffs: [
          { type: "removed", path: "row[0]", sourceValue: "a", targetValue: null },
        ],
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
        screen.getByText(/比較中|loading/i) ||
        screen.getByRole("progressbar")
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
        diffs: [
          { type: "changed", path: "row[0]", sourceValue: "a", targetValue: "b" },
        ],
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

      const { container } = render(<ResultSummary />);
      // CheckCircle アイコンまたは同等のアイコンが表示される
      const icon = container.querySelector("[data-testid='CheckCircleIcon']") ??
                   container.querySelector("svg.MuiSvgIcon-root");
      expect(icon).not.toBeNull();
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
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });
  });
});
