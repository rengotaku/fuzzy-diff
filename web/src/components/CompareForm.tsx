import { useCompareStore } from "@/stores/compareStore";
import { useCompare } from "@/hooks/useCompare";

export function CompareForm() {
  const source = useCompareStore((state) => state.source);
  const target = useCompareStore((state) => state.target);
  const isComparing = useCompareStore((state) => state.isComparing);
  const error = useCompareStore((state) => state.error);
  const setSource = useCompareStore((state) => state.setSource);
  const setTarget = useCompareStore((state) => state.setTarget);

  const { runCompare } = useCompare();

  return (
    <form noValidate autoComplete="off" data-testid="compare-form">
      <div className="mb-4">
        <label
          htmlFor="source-textarea"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Source
        </label>
        <textarea
          id="source-textarea"
          aria-label="元情報"
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        {source && (
          <button
            type="button"
            className="mt-1 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setSource("")}
          >
            クリア
          </button>
        )}
      </div>
      <div className="mb-4">
        <label
          htmlFor="target-textarea"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Target
        </label>
        <textarea
          id="target-textarea"
          aria-label="AI出力"
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        {target && (
          <button
            type="button"
            className="mt-1 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => setTarget("")}
          >
            クリア
          </button>
        )}
      </div>
      {error && (
        <div
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
        onClick={runCompare}
        disabled={isComparing}
      >
        比較
      </button>
    </form>
  );
}
