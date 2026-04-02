import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { useCompareStore } from "@/stores/compareStore";
import { useCompare } from "@/hooks/useCompare";

export function CompareForm() {
  const source = useCompareStore((state) => state.source);
  const target = useCompareStore((state) => state.target);
  const isComparing = useCompareStore((state) => state.isComparing);
  const error = useCompareStore((state) => state.error);
  const setSource = useCompareStore((state) => state.setSource);
  const setTarget = useCompareStore((state) => state.setTarget);

  const { runCompare } = useCompare();

  return (
    <Box component="form" noValidate autoComplete="off">
      <TextField
        id="source-textarea"
        label="元情報"
        multiline
        minRows={4}
        fullWidth
        value={source}
        onChange={(e) => setSource(e.target.value)}
        inputProps={{ "aria-label": "元情報" }}
        sx={{ mb: 2 }}
      />
      <TextField
        id="target-textarea"
        label="AI出力"
        multiline
        minRows={4}
        fullWidth
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        inputProps={{ "aria-label": "AI出力" }}
        sx={{ mb: 2 }}
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        onClick={runCompare}
        disabled={isComparing}
      >
        比較
      </Button>
    </Box>
  );
}
