import { useCompareStore } from "@/stores/compareStore";
import { Badge } from "@/components/ui/Badge";
import { computeDiffStats } from "@/utils/diffStats";

export function ResultSummary() {
  const result = useCompareStore((state) => state.result);
  const isComparing = useCompareStore((state) => state.isComparing);

  if (isComparing) {
    return (
      <div className="mt-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="text-sm text-gray-600">比較中...</span>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isPerfectMatch =
    result.match && result.score === 1.0 && result.diffs.length === 0;
  const isPartialMatch = result.match && result.diffs.length > 0;

  const label = isPerfectMatch
    ? "完全一致"
    : isPartialMatch
      ? "部分一致"
      : result.match
        ? "一致"
        : "不一致";

  const severity = isPerfectMatch
    ? "success"
    : isPartialMatch
      ? "info"
      : result.match
        ? "success"
        : "warning";

  const severityClasses: Record<string, string> = {
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  };

  const stats = computeDiffStats(result);

  const similarityVariant =
    stats.similarityLevel === "high"
      ? "success"
      : stats.similarityLevel === "medium"
        ? "warning"
        : "destructive";

  // score=0 や score=1 の場合はスコアテキストとバッジの "0" や "1" が重複するため非表示
  const showScoreText = result.score !== 0 && result.score !== 1.0;
  // diffs=0 の場合は差分件数テキストとバッジの "0" が重複するため非表示
  const showDiffCountText = result.diffs.length > 0;

  return (
    <div className="mt-4">
      <div
        className={`rounded-md border px-4 py-3 text-sm ${severityClasses[severity]}`}
        data-testid={isPerfectMatch ? "match-success" : undefined}
        role="alert"
      >
        {label}
      </div>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <Badge variant={similarityVariant}>
          {stats.similarityPercent}%
        </Badge>

        {result.diffs.length > 0 && (
          <div className="flex items-center gap-1" data-testid="diff-stats">
            {stats.addedCount > 0 && (
              <Badge variant="added">+{stats.addedCount}</Badge>
            )}
            {stats.removedCount > 0 && (
              <Badge variant="removed">-{stats.removedCount}</Badge>
            )}
            {stats.changedCount > 0 && (
              <Badge variant="changed">~{stats.changedCount}</Badge>
            )}
          </div>
        )}
      </div>

      {showScoreText && (
        <p className="mt-2 text-sm text-gray-700">スコア: {result.score}</p>
      )}
      {showDiffCountText && (
        <p className="text-sm text-gray-700">差分件数: {result.diffs.length}</p>
      )}
    </div>
  );
}
