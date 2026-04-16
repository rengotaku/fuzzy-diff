import { useCompareStore } from "@/stores/compareStore";
import type { DiffViewMode } from "@/utils/highlightMapper";

export function DiffViewSwitcher() {
  const viewMode = useCompareStore((state) => state.viewMode);
  const setViewMode = useCompareStore((state) => state.setViewMode);

  const modes: { value: DiffViewMode; label: string }[] = [
    { value: "list", label: "リスト" },
    { value: "side-by-side", label: "side-by-side" },
    { value: "inline", label: "インライン" },
  ];

  return (
    <div className="inline-flex rounded-md bg-gray-100 p-1" role="group">
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            viewMode === mode.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => setViewMode(mode.value)}
          aria-pressed={viewMode === mode.value}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
