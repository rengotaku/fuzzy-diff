import { useRef, useCallback } from "react";
import type { DiffItem } from "verify-ai";
import { findHighlightSpans, splitToSegments } from "@/utils/highlightMapper";
import type { TextSegment } from "@/utils/highlightMapper";
import { HighlightedText } from "@/components/HighlightedText";
import { useCompareStore } from "@/stores/compareStore";
import { buildSideBySidePairs } from "@/utils/lineDiff";
import type { SideBySideLinePair } from "@/utils/lineDiff";

interface SideBySideViewProps {
  source: string;
  target: string;
  diffs: readonly DiffItem[];
}

interface PaneLine {
  lineNumber: number | null;
  segments: TextSegment[];
  isPlaceholder: boolean;
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
      isPlaceholder: false,
    };
  });
}

function buildPaneLinesFromPairs(
  pairs: SideBySideLinePair[],
  side: "source" | "target",
  text: string,
  diffs: readonly DiffItem[],
): PaneLine[] {
  if (!text) return [];

  const lines = text.split("\n");
  const spans = findHighlightSpans(text, [...diffs], side);

  const lineOffsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push(offset);
    offset += line.length + 1;
  }

  const result: PaneLine[] = [];

  for (const pair of pairs) {
    const entry = side === "source" ? pair.left : pair.right;
    if (entry === null || entry.isPlaceholder) {
      result.push({ lineNumber: null, segments: [], isPlaceholder: true });
      continue;
    }

    // テキスト中から該当行のインデックスを探す
    const lineText = entry.text;
    const lineIdx = lines.findIndex((l, idx) => {
      // 行番号に基づいて正確にインデックスを特定
      if (side === "source") {
        return l === lineText && (pair.leftLineNumber === null || idx + 1 === pair.leftLineNumber);
      } else {
        return l === lineText && (pair.rightLineNumber === null || idx + 1 === pair.rightLineNumber);
      }
    });

    if (lineIdx === -1) {
      result.push({
        lineNumber: entry.lineNumber,
        segments: splitToSegments(lineText, []),
        isPlaceholder: false,
      });
      continue;
    }

    const lineStart = lineOffsets[lineIdx];
    const lineEnd = lineStart + lines[lineIdx].length;
    const lineSpans = spans
      .filter((s) => s.start >= lineStart && s.end <= lineEnd)
      .map((s) => ({ ...s, start: s.start - lineStart, end: s.end - lineStart }));

    result.push({
      lineNumber: entry.lineNumber,
      segments: splitToSegments(lineText, lineSpans),
      isPlaceholder: false,
    });
  }

  return result;
}

interface PaneWithScrollProps {
  text: string;
  diffs: readonly DiffItem[];
  side: "source" | "target";
  testId: string;
  hoveredDiffItem: DiffItem | null;
  onHoverDiffItem: (item: DiffItem | null) => void;
  pairs: SideBySideLinePair[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

function PaneWithScroll({
  text,
  diffs,
  side,
  testId,
  hoveredDiffItem,
  onHoverDiffItem,
  pairs,
  scrollRef,
  onScroll,
}: PaneWithScrollProps) {
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

  const paneLines = buildPaneLinesFromPairs(pairs, side, text, diffs);

  return (
    <div
      ref={scrollRef}
      data-testid={testId}
      className="font-mono flex-1 border border-gray-200 rounded min-h-[100px] overflow-auto text-[13px]"
      onScroll={onScroll}
    >
      {paneLines.map((paneLine, idx) => {
        if (paneLine.isPlaceholder) {
          return (
            <div
              key={`placeholder-${idx}`}
              data-placeholder
              data-line-row
              className="flex items-baseline px-2 py-px min-h-[1.4em] bg-gray-100 border border-dashed border-gray-300"
            >
              <span
                data-line-number
                className="w-8 min-w-8 inline-block text-right pr-2 text-gray-400 select-none text-xs"
              >
                {""}
              </span>
            </div>
          );
        }

        return (
          <div
            key={`line-${paneLine.lineNumber}-${idx}`}
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
        );
      })}
    </div>
  );
}

// Legacy Pane component for empty-text case (kept for backward compatibility)
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

  const sourcePaneRef = useRef<HTMLDivElement>(null);
  const targetPaneRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);

  const handleSourceScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    const target = e.currentTarget;
    if (targetPaneRef.current) {
      targetPaneRef.current.scrollTop = target.scrollTop;
      targetPaneRef.current.scrollLeft = target.scrollLeft;
    }
    isSyncing.current = false;
  }, []);

  const handleTargetScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    const target = e.currentTarget;
    if (sourcePaneRef.current) {
      sourcePaneRef.current.scrollTop = target.scrollTop;
      sourcePaneRef.current.scrollLeft = target.scrollLeft;
    }
    isSyncing.current = false;
  }, []);

  // 両方のテキストが存在する場合は buildSideBySidePairs を使う
  if (source && target) {
    const pairs = buildSideBySidePairs(source, target, diffs);

    return (
      <div className="flex gap-4 w-full">
        <PaneWithScroll
          text={source}
          diffs={diffs}
          side="source"
          testId="source-pane"
          hoveredDiffItem={hoveredDiffItem}
          onHoverDiffItem={setHoveredDiffItem}
          pairs={pairs}
          scrollRef={sourcePaneRef}
          onScroll={handleSourceScroll}
        />
        <PaneWithScroll
          text={target}
          diffs={diffs}
          side="target"
          testId="target-pane"
          hoveredDiffItem={hoveredDiffItem}
          onHoverDiffItem={setHoveredDiffItem}
          pairs={pairs}
          scrollRef={targetPaneRef}
          onScroll={handleTargetScroll}
        />
      </div>
    );
  }

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
