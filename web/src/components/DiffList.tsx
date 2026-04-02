import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { DiffItem } from "verify-ai";
import { diffColors } from "@/theme/diffColors";

const DIFF_LABELS: Record<DiffItem["type"], string> = {
  added: "追加",
  removed: "欠落",
  changed: "変更",
};

interface DiffListProps {
  diffs: DiffItem[];
}

export function DiffList({ diffs }: DiffListProps) {
  if (diffs.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>差分なし</Typography>
      </Box>
    );
  }

  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {diffs.map((diff, index) => {
        const colors = diffColors[diff.type];
        return (
          <Box
            key={index}
            component="li"
            data-diff-type={diff.type}
            sx={{
              backgroundColor: colors.background,
              color: colors.text,
              p: 1.5,
              mb: 1,
              borderRadius: 1,
              borderLeft: `4px solid ${colors.text}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
              {DIFF_LABELS[diff.type]}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace", mb: 0.5 }}>
              {diff.path}
            </Typography>
            {diff.type === "changed" ? (
              <>
                <Box data-value-type="source" sx={{ fontSize: "0.85rem" }}>
                  {diff.sourceValue}
                </Box>
                <Box data-value-type="target" sx={{ fontSize: "0.85rem" }}>
                  {diff.targetValue}
                </Box>
              </>
            ) : (
              <Box sx={{ fontSize: "0.85rem" }}>
                {diff.type === "added" ? diff.targetValue : diff.sourceValue}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
