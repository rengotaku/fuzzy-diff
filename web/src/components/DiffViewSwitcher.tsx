import { List, Columns2, FileText } from "lucide-react";
import { useCompareStore } from "@/stores/compareStore";
import type { DiffViewMode } from "@/utils/highlightMapper";

const modeIcons: Record<DiffViewMode, React.ReactElement> = {
  list: <List data-testid="icon-list" className="w-4 h-4" />,
  "side-by-side": <Columns2 data-testid="icon-side-by-side" className="w-4 h-4" />,
  inline: <FileText data-testid="icon-inline" className="w-4 h-4" />,
};

export function DiffViewSwitcher() {
  const viewMode = useCompareStore((state) => state.viewMode);
  const setViewMode = useCompareStore((state) => state.setViewMode);

  const modes: { value: DiffViewMode; label: string }[] = [
    { value: "list", label: "リスト" },
    { value: "side-by-side", label: "side-by-side" },
    { value: "inline", label: "インライン" },
  ];

  return (
    <div
      className="inline-flex rounded-md bg-gray-100 p-1"
      role="group"
      data-testid="diff-view-switcher"
    >
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            viewMode === mode.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => setViewMode(mode.value)}
          aria-pressed={viewMode === mode.value}
        >
          {modeIcons[mode.value]}
          {mode.label}
        </button>
      ))}
    </div>
  );
}
