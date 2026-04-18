import type { DiffItem } from "verify-ai";
import type { TextSegment } from "@/utils/highlightMapper";

interface HighlightedTextProps {
  segments: TextSegment[];
  hoveredDiffItem?: DiffItem | null;
  onHoverDiffItem?: (item: DiffItem | null) => void;
}

const diffColors = {
  added: { background: "#d4f4dd", text: "#16a34a" },
  removed: { background: "#fdd4d4", text: "#dc2626" },
  changed: { background: "#dbeafe", text: "#1d4ed8" },
} as const;

const blinkKeyframes = `
@keyframes diff-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

let styleInjected = false;
function injectBlinkStyle() {
  if (styleInjected) return;
  const style = document.createElement("style");
  style.textContent = blinkKeyframes;
  document.head.appendChild(style);
  styleInjected = true;
}

export function HighlightedText({
  segments,
  hoveredDiffItem,
  onHoverDiffItem,
}: HighlightedTextProps) {
  injectBlinkStyle();

  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.highlight) {
          return <span key={index}>{segment.text}</span>;
        }

        const { diffType, diffItem } = segment.highlight;
        const colors = diffColors[diffType];
        const isBlinking =
          hoveredDiffItem !== null &&
          hoveredDiffItem !== undefined &&
          hoveredDiffItem === diffItem;

        return (
          <span
            key={index}
            data-diff-type={diffType}
            style={{
              backgroundColor: colors.background,
              color: colors.text,
              animation: isBlinking ? "diff-blink 0.6s ease-in-out infinite" : undefined,
              cursor: onHoverDiffItem ? "pointer" : undefined,
            }}
            onMouseEnter={() => onHoverDiffItem?.(diffItem)}
            onMouseLeave={() => onHoverDiffItem?.(null)}
          >
            {segment.text}
          </span>
        );
      })}
    </>
  );
}
