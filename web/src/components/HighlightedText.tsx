import type { TextSegment } from "@/utils/highlightMapper";
import { diffColors } from "@/theme/diffColors";

interface HighlightedTextProps {
  segments: TextSegment[];
}

export function HighlightedText({ segments }: HighlightedTextProps) {
  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.highlight) {
          return <span key={index}>{segment.text}</span>;
        }

        const { diffType } = segment.highlight;
        const colors = diffColors[diffType];

        return (
          <span
            key={index}
            data-diff-type={diffType}
            style={{
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            {segment.text}
          </span>
        );
      })}
    </>
  );
}
