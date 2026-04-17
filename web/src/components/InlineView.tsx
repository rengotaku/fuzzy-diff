import type { DiffItem } from "verify-ai";
import { buildUnifiedLines } from "@/utils/lineDiff";
import type { DiffLine } from "@/utils/lineDiff";
import { HighlightedText } from "@/components/HighlightedText";
import { useCompareStore } from "@/stores/compareStore";

interface InlineViewProps {
  source: string;
  target: string;
  diffs: readonly DiffItem[];
}

const lineBgClass: Record<DiffLine["type"], string> = {
  unchanged: "",
  removed: "bg-red-50",
  added: "bg-green-50",
  "changed-source": "bg-red-50",
  "changed-target": "bg-green-50",
};

const prefixMap: Record<DiffLine["type"], string> = {
  unchanged: "  ",
  removed: "- ",
  added: "+ ",
  "changed-source": "- ",
  "changed-target": "+ ",
};

function InlineLine({
  line,
  hoveredDiffItem,
  onHoverDiffItem,
}: {
  line: DiffLine;
  hoveredDiffItem: DiffItem | null;
  onHoverDiffItem: (item: DiffItem | null) => void;
}) {
  return (
    <div
      data-line-type={line.type}
      data-line-row
      className={`flex items-baseline px-2 py-px whitespace-pre-wrap break-words min-h-[1.4em] border-b border-black/[0.04] hover:bg-gray-50 transition ${lineBgClass[line.type]}`}
    >
      <span
        data-line-number
        className="w-8 min-w-8 inline-block text-right pr-2 text-gray-400 select-none text-xs"
      >
        {line.lineNumber}
      </span>
      <span data-prefix className="text-gray-400 select-none mr-2">
        {prefixMap[line.type]}
      </span>
      <HighlightedText
        segments={line.segments}
        hoveredDiffItem={hoveredDiffItem}
        onHoverDiffItem={onHoverDiffItem}
      />
    </div>
  );
}

export function InlineView({ source, target, diffs }: InlineViewProps) {
  const hoveredDiffItem = useCompareStore((s) => s.hoveredDiffItem);
  const setHoveredDiffItem = useCompareStore((s) => s.setHoveredDiffItem);

  if (!source && !target) {
    return (
      <div
        data-testid="inline-view"
        className="font-mono w-full text-[13px] border border-gray-200 rounded overflow-auto"
      >
        <span className="text-gray-400 italic p-3 block">テキストなし</span>
      </div>
    );
  }

  const lines = buildUnifiedLines(source, target, diffs);

  return (
    <div
      data-testid="inline-view"
      className="font-mono w-full text-[13px] border border-gray-200 rounded overflow-auto"
    >
      {lines.map((line, index) => (
        <InlineLine
          key={index}
          line={line}
          hoveredDiffItem={hoveredDiffItem}
          onHoverDiffItem={setHoveredDiffItem}
        />
      ))}
    </div>
  );
}
