import type { DiffItem } from "verify-ai";
import { findHighlightSpans, splitToSegments } from "@/utils/highlightMapper";
import { HighlightedText } from "@/components/HighlightedText";
import { useCompareStore } from "@/stores/compareStore";

interface SideBySideViewProps {
  source: string;
  target: string;
  diffs: readonly DiffItem[];
}

const paneStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflow: "auto",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  minHeight: "100px",
};

const containerStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  width: "100%",
};

const emptyStyle: React.CSSProperties = {
  color: "#9e9e9e",
  fontStyle: "italic",
};

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
      <div data-testid={testId} style={paneStyle}>
        <span style={emptyStyle}>テキストなし</span>
      </div>
    );
  }

  const spans = findHighlightSpans(text, [...diffs], side);
  const segments = splitToSegments(text, spans);

  return (
    <div data-testid={testId} style={paneStyle}>
      <HighlightedText
        segments={segments}
        hoveredDiffItem={hoveredDiffItem}
        onHoverDiffItem={onHoverDiffItem}
      />
    </div>
  );
}

export function SideBySideView({ source, target, diffs }: SideBySideViewProps) {
  const hoveredDiffItem = useCompareStore((s) => s.hoveredDiffItem);
  const setHoveredDiffItem = useCompareStore((s) => s.setHoveredDiffItem);

  return (
    <div style={containerStyle}>
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
