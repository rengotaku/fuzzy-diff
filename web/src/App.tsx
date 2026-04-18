import { useState, useCallback } from "react";
import { CompareForm } from "@/components/CompareForm";
import { DiffList } from "@/components/DiffList";
import { DiffViewSwitcher } from "@/components/DiffViewSwitcher";
import { SideBySideView } from "@/components/SideBySideView";
import { InlineView } from "@/components/InlineView";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useCompareStore } from "@/stores/compareStore";
import { computeDiffStats } from "@/utils/diffStats";
import type { DiffItem } from "verify-ai";

type CopyStatus = "idle" | "success" | "error";

function buildDiffText(diffs: readonly DiffItem[]): string {
  return diffs
    .map((diff) => {
      const parts: string[] = [`[${diff.type}] ${diff.path}`];
      if (diff.sourceValue !== null && diff.sourceValue !== undefined) {
        parts.push(`  source: ${diff.sourceValue}`);
      }
      if (diff.targetValue !== null && diff.targetValue !== undefined) {
        parts.push(`  target: ${diff.targetValue}`);
      }
      return parts.join("\n");
    })
    .join("\n\n");
}

function App() {
  const result = useCompareStore((state) => state.result);
  const source = useCompareStore((state) => state.source);
  const target = useCompareStore((state) => state.target);
  const viewMode = useCompareStore((state) => state.viewMode);
  const reset = useCompareStore((state) => state.reset);

  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const handleCopy = useCallback(async () => {
    if (!result) return;

    const text = buildDiffText(result.diffs);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API is not available");
      }
      await navigator.clipboard.writeText(text);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }

    setTimeout(() => {
      setCopyStatus("idle");
    }, 3000);
  }, [result]);

  const isPerfectMatch =
    result !== null &&
    result.match &&
    result.score === 1.0 &&
    result.diffs.length === 0;
  const isPartialMatch = result !== null && result.match && result.diffs.length > 0;

  const label =
    result === null
      ? ""
      : isPerfectMatch
        ? "完全一致"
        : isPartialMatch
          ? "部分一致"
          : result.match
            ? "一致"
            : "不一致";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <CompareForm />
      {result && (
        <>
          <Card data-testid="summary-card" className="mt-4">
            <CardContent>
              <div data-testid="summary-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div data-testid="summary-col-left">
                  <p className="text-sm font-medium mb-1">{label}</p>
                  <p className="text-xs text-gray-600 truncate">
                    ソース: {source.slice(0, 50)}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    ターゲット: {target.slice(0, 50)}
                  </p>
                </div>
                <div data-testid="summary-col-center" className="flex flex-col gap-2">
                  {(() => {
                    const stats = computeDiffStats(result);
                    const similarityVariant =
                      stats.similarityLevel === "high"
                        ? "success"
                        : stats.similarityLevel === "medium"
                          ? "warning"
                          : "destructive";
                    return (
                      <>
                        <Badge variant={similarityVariant}>{stats.similarityPercent}%</Badge>
                        {stats.addedCount > 0 && (
                          <Badge variant="added">+{stats.addedCount}</Badge>
                        )}
                        {stats.removedCount > 0 && (
                          <Badge variant="removed">-{stats.removedCount}</Badge>
                        )}
                        {stats.changedCount > 0 && (
                          <Badge variant="changed">~{stats.changedCount}</Badge>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div data-testid="summary-col-right" className="flex flex-col gap-2">
                  <DiffViewSwitcher />
                  <div className="flex items-center gap-2">
                    {copyStatus === "success" && (
                      <span className="text-sm text-green-600">コピーしました</span>
                    )}
                    {copyStatus === "error" && (
                      <span className="text-sm text-red-600">コピーに失敗</span>
                    )}
                    <button
                      data-testid="copy-button"
                      onClick={handleCopy}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      type="button"
                    >
                      コピー
                    </button>
                  </div>
                  <button
                    data-testid="new-comparison-button"
                    onClick={reset}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    type="button"
                  >
                    新規比較
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="diff-card" className="mt-4">
            <CardContent>
              {viewMode === "list" && <DiffList diffs={result.diffs} />}
              {viewMode === "side-by-side" && (
                <SideBySideView source={source} target={target} diffs={result.diffs} />
              )}
              {viewMode === "inline" && (
                <InlineView source={source} target={target} diffs={result.diffs} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default App;
