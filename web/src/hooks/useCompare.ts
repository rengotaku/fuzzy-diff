import { compare } from "verify-ai";
import { useCompareStore } from "@/stores/compareStore";

export function useCompare() {
  const { setResult, setIsComparing, setError } = useCompareStore.getState();

  const runCompare = () => {
    const currentSource = useCompareStore.getState().source;
    const currentTarget = useCompareStore.getState().target;

    // バリデーション: 空文字列または空白のみは不可
    if (!currentSource.trim() || !currentTarget.trim()) {
      setError("両方のテキストを入力してください");
      return;
    }

    // 前回のエラーをクリア
    setError(null);
    setIsComparing(true);

    try {
      const result = compare(currentSource, currentTarget);
      setResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "比較に失敗しました";
      setError(message);
      setResult(null);
    } finally {
      setIsComparing(false);
    }
  };

  return { runCompare };
}
