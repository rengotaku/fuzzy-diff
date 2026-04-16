import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

  const isPerfectMatch = result.match && result.score === 1.0 && result.diffs.length === 0;
  const isPartialMatch = result.match && result.diffs.length > 0;

  const label = isPerfectMatch
    ? "完全一致"
    : isPartialMatch
      ? "部分一致"
      : result.match
        ? "一致"
        : "不一致";

  const severity = isPerfectMatch
    ? "success"
    : isPartialMatch
      ? "info"
      : result.match
        ? "success"
        : "warning";

  return (
    <Box sx={{ mt: 2 }}>
      <Alert
        severity={severity}
        data-testid={isPerfectMatch ? "match-success" : undefined}
        icon={isPerfectMatch ? <CheckCircleIcon /> : undefined}
        sx={{ mb: 1 }}
      >
        {label}
      </Alert>
      <Typography>
        スコア: {result.score}
      </Typography>
      <Typography>
        差分件数: {result.diffs.length}
      </Typography>
    </Box>
  );
}
