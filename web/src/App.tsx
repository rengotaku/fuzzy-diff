import { CompareForm } from "@/components/CompareForm";
import { ResultSummary } from "@/components/ResultSummary";
import { DiffList } from "@/components/DiffList";
import { DiffViewSwitcher } from "@/components/DiffViewSwitcher";
import { SideBySideView } from "@/components/SideBySideView";
import { InlineView } from "@/components/InlineView";
import { useCompareStore } from "@/stores/compareStore";

function App() {
  const result = useCompareStore((state) => state.result);
  const source = useCompareStore((state) => state.source);
  const target = useCompareStore((state) => state.target);
  const viewMode = useCompareStore((state) => state.viewMode);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <CompareForm />
      <ResultSummary />
      {result && (
        <>
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
        </>
      )}
    </div>
  );
}

export default App;
