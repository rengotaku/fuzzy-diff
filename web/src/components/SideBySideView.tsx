import type { DiffItem } from "verify-ai";
import { findHighlightSpans, splitToSegments } from "@/utils/highlightMapper";
import type { TextSegment } from "@/utils/highlightMapper";
import { HighlightedText } from "@/components/HighlightedText";
import { useCompareStore } from "@/stores/compareStore";

interface SideBySideViewProps {
  source: string;
  target: string;
  diffs: readonly DiffItem[];
}

interface PaneLine {
  lineNumber: number;
  segments: TextSegment[];
}

function buildPaneLines(
  text: string,
  diffs: readonly DiffItem[],
  side: "source" | "target",
): PaneLine[] {
  const lines = text.split("\n");
  const spans = findHighlightSpans(text, [...diffs], side);

  // テキスト全体の行オフセットを計算
  const lineOffsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push(offset);
    offset += line.length + 1;
  }

  return lines.map((line, i) => {
    const lineStart = lineOffsets[i];
    const lineEnd = lineStart + line.length;
    const lineSpans = spans
      .filter((s) => s.start >= lineStart && s.end <= lineEnd)
      .map((s) => ({ ...s, start: s.start - lineStart, end: s.end - lineStart }));
    return {
      lineNumber: i + 1,
      segments: splitToSegments(line, lineSpans),
    };
  });
}

function Pane({
  text,
  diffs,
  side,
  testId,
  hoveredDiffItem,
  onHoverDiffItem,
}: {
  text: string;
  diffs: readonly DiffItem[];
  side: "source" | "target";
  testId: string;
  hoveredDiffItem: DiffItem | null;
  onHoverDiffItem: (item: DiffItem | null) => void;
}) {
  if (!text) {
    return (
      <div
        data-testid={testId}
        className="font-mono flex-1 border border-gray-200 rounded min-h-[100px] overflow-auto text-[13px]"
      >
        <span className="text-gray-400 italic p-3 block">テキストなし</span>
      </div>
    );
  }

  const paneLines = buildPaneLines(text, diffs, side);

  return (
    <div
      data-testid={testId}
      className="font-mono flex-1 border border-gray-200 rounded min-h-[100px] overflow-auto text-[13px]"
    >
      {paneLines.map((paneLine) => (
        <div
          key={paneLine.lineNumber}
          data-line-row
          className="flex items-baseline px-2 py-px whitespace-pre-wrap break-words min-h-[1.4em] border-b border-black/[0.04] hover:bg-gray-50 transition"
        >
          <span
            data-line-number
            className="w-8 min-w-8 inline-block text-right pr-2 text-gray-400 select-none text-xs"
          >
            {paneLine.lineNumber}
          </span>
          <span>
            <HighlightedText
              segments={paneLine.segments}
              hoveredDiffItem={hoveredDiffItem}
              onHoverDiffItem={onHoverDiffItem}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function SideBySideView({ source, target, diffs }: SideBySideViewProps) {
  const hoveredDiffItem = useCompareStore((s) => s.hoveredDiffItem);
  const setHoveredDiffItem = useCompareStore((s) => s.setHoveredDiffItem);

  return (
    <div className="flex gap-4 w-full">
      <Pane
        text={source}
        diffs={diffs}
        side="source"
        testId="source-pane"
        hoveredDiffItem={hoveredDiffItem}
        onHoverDiffItem={setHoveredDiffItem}
      />
      <Pane
        text={target}
        diffs={diffs}
        side="target"
        testId="target-pane"
        hoveredDiffItem={hoveredDiffItem}
        onHoverDiffItem={setHoveredDiffItem}
      />
    </div>
  );
}
