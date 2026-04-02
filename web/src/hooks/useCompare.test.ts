import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCompare } from "./useCompare";
import { useCompareStore } from "@/stores/compareStore";

// verify-ai の compare() をモック
vi.mock("verify-ai", () => ({
  compare: vi.fn(),
}));

// モックされた compare を取得
import { compare } from "verify-ai";
const mockCompare = vi.mocked(compare);

describe("useCompare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCompareStore.setState({
      source: "",
      target: "",
      result: null,
      isComparing: false,
      error: null,
    });
  });

  // --- 正常系: compare() 呼び出し ---

  describe("runCompare - 正常系", () => {
    it("source と target を渡して compare() を呼び出す", () => {
      mockCompare.mockReturnValue({
        score: 0.9,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      });

      useCompareStore.setState({ source: "hello", target: "hello" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).toHaveBeenCalledWith(
        { source: "hello", target: "hello" },
      );
    });

    it("比較結果を store に反映する", () => {
      const mockResult = {
        score: 0.75,
        match: false,
        diffs: [
          { type: "changed" as const, path: "row[0].name", sourceValue: "A", targetValue: "B" },
        ],
        sourceFormat: { type: "plain" as const, confidence: 1.0 },
        targetFormat: { type: "plain" as const, confidence: 1.0 },
      };
      mockCompare.mockReturnValue(mockResult);

      useCompareStore.setState({ source: "A", target: "B" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      const storeState = useCompareStore.getState();
      expect(storeState.result).toEqual(mockResult);
      expect(storeState.isComparing).toBe(false);
      expect(storeState.error).toBeNull();
    });

    it("比較中に isComparing が true になる", () => {
      // compare が呼ばれた時点での isComparing を記録
      let isComparingDuringCall = false;
      mockCompare.mockImplementation(() => {
        isComparingDuringCall = useCompareStore.getState().isComparing;
        return {
          score: 1.0,
          match: true,
          diffs: [],
          sourceFormat: { type: "plain" as const, confidence: 1.0 },
          targetFormat: { type: "plain" as const, confidence: 1.0 },
        };
      });

      useCompareStore.setState({ source: "a", target: "a" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(isComparingDuringCall).toBe(true);
    });

    it("完了後に isComparing が false になる", () => {
      mockCompare.mockReturnValue({
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain" as const, confidence: 1.0 },
        targetFormat: { type: "plain" as const, confidence: 1.0 },
      });

      useCompareStore.setState({ source: "a", target: "a" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(useCompareStore.getState().isComparing).toBe(false);
    });
  });

  // --- バリデーションエラー ---

  describe("runCompare - バリデーション", () => {
    it("source が空の場合エラーを設定する", () => {
      useCompareStore.setState({ source: "", target: "world" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).not.toHaveBeenCalled();
      expect(useCompareStore.getState().error).toBeTruthy();
    });

    it("target が空の場合エラーを設定する", () => {
      useCompareStore.setState({ source: "hello", target: "" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).not.toHaveBeenCalled();
      expect(useCompareStore.getState().error).toBeTruthy();
    });

    it("両方空の場合エラーを設定する", () => {
      useCompareStore.setState({ source: "", target: "" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).not.toHaveBeenCalled();
      expect(useCompareStore.getState().error).toBeTruthy();
    });

    it("空白のみの入力でもバリデーションエラーになる", () => {
      useCompareStore.setState({ source: "   ", target: "   " });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).not.toHaveBeenCalled();
      expect(useCompareStore.getState().error).toBeTruthy();
    });
  });

  // --- エラーハンドリング ---

  describe("runCompare - エラーハンドリング", () => {
    it("compare() が例外を投げた場合エラーを store に設定する", () => {
      mockCompare.mockImplementation(() => {
        throw new Error("Comparison failed");
      });

      useCompareStore.setState({ source: "a", target: "b" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(useCompareStore.getState().error).toBeTruthy();
      expect(useCompareStore.getState().isComparing).toBe(false);
      expect(useCompareStore.getState().result).toBeNull();
    });
  });

  // --- エッジケース ---

  describe("runCompare - エッジケース", () => {
    it("非常に大きなテキストでも compare() を呼び出す", () => {
      const largeText = "a".repeat(10000);
      mockCompare.mockReturnValue({
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain" as const, confidence: 1.0 },
        targetFormat: { type: "plain" as const, confidence: 1.0 },
      });

      useCompareStore.setState({ source: largeText, target: largeText });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).toHaveBeenCalledTimes(1);
    });

    it("特殊文字を含むテキストを正しく処理する", () => {
      const specialText = '<script>alert("xss")</script> & "quotes" \'single\'';
      mockCompare.mockReturnValue({
        score: 0.5,
        match: false,
        diffs: [],
        sourceFormat: { type: "plain" as const, confidence: 1.0 },
        targetFormat: { type: "plain" as const, confidence: 1.0 },
      });

      useCompareStore.setState({ source: specialText, target: "normal" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(mockCompare).toHaveBeenCalledWith(
        { source: specialText, target: "normal" },
      );
    });

    it("再比較時に前回のエラーがクリアされる", () => {
      mockCompare.mockReturnValue({
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain" as const, confidence: 1.0 },
        targetFormat: { type: "plain" as const, confidence: 1.0 },
      });

      useCompareStore.setState({ source: "a", target: "a", error: "前回のエラー" });

      const { result } = renderHook(() => useCompare());
      act(() => {
        result.current.runCompare();
      });

      expect(useCompareStore.getState().error).toBeNull();
    });
  });
});
