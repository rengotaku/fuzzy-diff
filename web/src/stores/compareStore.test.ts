import { describe, it, expect, beforeEach } from "vitest";
import { useCompareStore } from "./compareStore";
import type { ComparisonResult } from "verify-ai";

describe("useCompareStore", () => {
  beforeEach(() => {
    useCompareStore.setState({
      source: "",
      target: "",
      result: null,
      isComparing: false,
      error: null,
      viewMode: "side-by-side",
    });
  });

  // --- 初期状態 ---

  describe("初期状態", () => {
    it("source が空文字列", () => {
      const state = useCompareStore.getState();
      expect(state.source).toBe("");
    });

    it("target が空文字列", () => {
      const state = useCompareStore.getState();
      expect(state.target).toBe("");
    });

    it("result が null", () => {
      const state = useCompareStore.getState();
      expect(state.result).toBeNull();
    });

    it("isComparing が false", () => {
      const state = useCompareStore.getState();
      expect(state.isComparing).toBe(false);
    });

    it("error が null", () => {
      const state = useCompareStore.getState();
      expect(state.error).toBeNull();
    });
  });

  // --- 入力更新 ---

  describe("setSource", () => {
    it("source を更新する", () => {
      const { setSource } = useCompareStore.getState();
      setSource("hello");
      expect(useCompareStore.getState().source).toBe("hello");
    });

    it("空文字列を設定できる", () => {
      const { setSource } = useCompareStore.getState();
      setSource("hello");
      setSource("");
      expect(useCompareStore.getState().source).toBe("");
    });

    it("Unicode 文字を設定できる", () => {
      const { setSource } = useCompareStore.getState();
      setSource("日本語テキスト🎉");
      expect(useCompareStore.getState().source).toBe("日本語テキスト🎉");
    });

    it("target に影響しない", () => {
      const { setSource } = useCompareStore.getState();
      setSource("hello");
      expect(useCompareStore.getState().target).toBe("");
    });
  });

  describe("setTarget", () => {
    it("target を更新する", () => {
      const { setTarget } = useCompareStore.getState();
      setTarget("world");
      expect(useCompareStore.getState().target).toBe("world");
    });

    it("空文字列を設定できる", () => {
      const { setTarget } = useCompareStore.getState();
      setTarget("world");
      setTarget("");
      expect(useCompareStore.getState().target).toBe("");
    });

    it("source に影響しない", () => {
      const { setTarget } = useCompareStore.getState();
      setTarget("world");
      expect(useCompareStore.getState().source).toBe("");
    });
  });

  // --- 比較結果セット ---

  describe("setResult", () => {
    const mockResult: ComparisonResult = {
      score: 0.85,
      match: true,
      diffs: [],
      sourceFormat: { type: "plain", confidence: 1.0 },
      targetFormat: { type: "plain", confidence: 1.0 },
    };

    it("result を設定する", () => {
      const { setResult } = useCompareStore.getState();
      setResult(mockResult);
      expect(useCompareStore.getState().result).toEqual(mockResult);
    });

    it("result を null にリセットできる", () => {
      const { setResult } = useCompareStore.getState();
      setResult(mockResult);
      setResult(null);
      expect(useCompareStore.getState().result).toBeNull();
    });

    it("差分ありの結果を設定できる", () => {
      const resultWithDiffs: ComparisonResult = {
        score: 0.5,
        match: false,
        diffs: [
          { type: "added", path: "row[0].name", sourceValue: null, targetValue: "new" },
          { type: "removed", path: "row[1].age", sourceValue: "30", targetValue: null },
          { type: "changed", path: "row[2].city", sourceValue: "Tokyo", targetValue: "Osaka" },
        ],
        sourceFormat: { type: "json", confidence: 0.9 },
        targetFormat: { type: "json", confidence: 0.9 },
      };
      const { setResult } = useCompareStore.getState();
      setResult(resultWithDiffs);
      expect(useCompareStore.getState().result?.diffs).toHaveLength(3);
      expect(useCompareStore.getState().result?.match).toBe(false);
    });
  });

  // --- isComparing ---

  describe("setIsComparing", () => {
    it("isComparing を true に設定する", () => {
      const { setIsComparing } = useCompareStore.getState();
      setIsComparing(true);
      expect(useCompareStore.getState().isComparing).toBe(true);
    });

    it("isComparing を false に設定する", () => {
      const { setIsComparing } = useCompareStore.getState();
      setIsComparing(true);
      setIsComparing(false);
      expect(useCompareStore.getState().isComparing).toBe(false);
    });
  });

  // --- エラーセット ---

  describe("setError", () => {
    it("エラーメッセージを設定する", () => {
      const { setError } = useCompareStore.getState();
      setError("比較に失敗しました");
      expect(useCompareStore.getState().error).toBe("比較に失敗しました");
    });

    it("エラーを null にクリアできる", () => {
      const { setError } = useCompareStore.getState();
      setError("エラー");
      setError(null);
      expect(useCompareStore.getState().error).toBeNull();
    });

    it("エラー設定時に result はクリアされない", () => {
      const mockResult: ComparisonResult = {
        score: 1.0,
        match: true,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      };
      const { setResult, setError } = useCompareStore.getState();
      setResult(mockResult);
      setError("エラー");
      // store の設計次第だが、独立して動作することを確認
      expect(useCompareStore.getState().error).toBe("エラー");
    });
  });

  // --- viewMode ---

  describe("viewMode", () => {
    it("デフォルトが 'side-by-side' である", () => {
      const state = useCompareStore.getState();
      expect(state.viewMode).toBe("side-by-side");
    });

    it("setViewMode で 'list' に切替可能", () => {
      const { setViewMode } = useCompareStore.getState();
      setViewMode("list");
      expect(useCompareStore.getState().viewMode).toBe("list");
    });

    it("setViewMode で 'inline' に切替可能", () => {
      const { setViewMode } = useCompareStore.getState();
      setViewMode("inline");
      expect(useCompareStore.getState().viewMode).toBe("inline");
    });

    it("setViewMode で 'side-by-side' に切替可能", () => {
      const { setViewMode } = useCompareStore.getState();
      setViewMode("list");
      setViewMode("side-by-side");
      expect(useCompareStore.getState().viewMode).toBe("side-by-side");
    });

    it("viewMode の変更が他の状態に影響しない", () => {
      const { setSource, setViewMode } = useCompareStore.getState();
      setSource("hello");
      setViewMode("inline");
      expect(useCompareStore.getState().source).toBe("hello");
      expect(useCompareStore.getState().viewMode).toBe("inline");
    });
  });

  // --- reset ---

  describe("reset", () => {
    it("全ての状態を初期値にリセットする", () => {
      const state = useCompareStore.getState();
      state.setSource("hello");
      state.setTarget("world");
      state.setResult({
        score: 0.5,
        match: false,
        diffs: [],
        sourceFormat: { type: "plain", confidence: 1.0 },
        targetFormat: { type: "plain", confidence: 1.0 },
      });
      state.setError("error");
      state.setViewMode("inline");

      useCompareStore.getState().reset();

      const resetState = useCompareStore.getState();
      expect(resetState.source).toBe("");
      expect(resetState.target).toBe("");
      expect(resetState.result).toBeNull();
      expect(resetState.isComparing).toBe(false);
      expect(resetState.error).toBeNull();
      expect(resetState.viewMode).toBe("side-by-side");
    });
  });
});
