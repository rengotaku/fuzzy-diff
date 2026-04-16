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

const containerStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "monospace",
  fontSize: "13px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  overflow: "auto",
};

const emptyStyle: React.CSSProperties = {
  color: "#9e9e9e",
  fontStyle: "italic",
  padding: "12px",
};

const lineColors: Record<DiffLine["type"], React.CSSProperties> = {
  unchanged: {
    backgroundColor: "transparent",
  },
  removed: {
    backgroundColor: "rgb(255, 235, 238)",
  },
  added: {
    backgroundColor: "rgb(232, 245, 233)",
  },
  "changed-source": {
    backgroundColor: "rgb(255, 235, 238)",
  },
  "changed-target": {
    backgroundColor: "rgb(232, 245, 233)",
  },
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
      style={{
        ...lineColors[line.type],
        padding: "1px 8px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        minHeight: "1.4em",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <span style={{ color: "#999", userSelect: "none", marginRight: "8px" }}>
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
      <div style={containerStyle} data-testid="inline-view">
        <span style={emptyStyle}>テキストなし</span>
      </div>
    );
  }

  const lines = buildUnifiedLines(source, target, diffs);

  return (
    <div style={containerStyle} data-testid="inline-view">
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
