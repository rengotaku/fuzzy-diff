import { useState, useCallback } from "react";
import { CompareForm } from "@/components/CompareForm";
import { ResultSummary } from "@/components/ResultSummary";
import { DiffList } from "@/components/DiffList";
import { DiffViewSwitcher } from "@/components/DiffViewSwitcher";
import { SideBySideView } from "@/components/SideBySideView";
import { InlineView } from "@/components/InlineView";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useCompareStore } from "@/stores/compareStore";
import type { DiffItem } from "verify-ai";

type CopyStatus = "idle" | "success" | "error";

function buildDiffText(diffs: DiffItem[]): string {
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

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <CompareForm />
      {result && (
        <Card className="mt-4">
          <CardHeader>
            <ResultSummary />
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
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <DiffViewSwitcher />
            </div>
            {viewMode === "list" && <DiffList diffs={result.diffs} />}
            {viewMode === "side-by-side" && (
              <SideBySideView
                source={source}
                target={target}
                diffs={result.diffs}
              />
            )}
            {viewMode === "inline" && (
              <InlineView
                source={source}
                target={target}
                diffs={result.diffs}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default App;
