import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useCompareStore } from "@/stores/compareStore";

export function ResultSummary() {
  const result = useCompareStore((state) => state.result);
  const isComparing = useCompareStore((state) => state.isComparing);

  if (isComparing) {
    return (
      <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} />
        <Typography>比較中...</Typography>
      </Box>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">
        {result.match ? "一致" : "不一致"}
      </Typography>
      <Typography>
        スコア: {result.score}
      </Typography>
      <Typography>
        差分件数: {result.diffs.length}
      </Typography>
    </Box>
  );
}
