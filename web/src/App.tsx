import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { theme } from "@/theme";
import { CompareForm } from "@/components/CompareForm";
import { ResultSummary } from "@/components/ResultSummary";
import { DiffList } from "@/components/DiffList";
import { DiffViewSwitcher } from "@/components/DiffViewSwitcher";
import { SideBySideView } from "@/components/SideBySideView";
import { useCompareStore } from "@/stores/compareStore";

function App() {
  const result = useCompareStore((state) => state.result);
  const source = useCompareStore((state) => state.source);
  const target = useCompareStore((state) => state.target);
  const viewMode = useCompareStore((state) => state.viewMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CompareForm />
        <ResultSummary />
        {result && (
          <>
            <Box sx={{ mb: 2 }}>
              <DiffViewSwitcher />
            </Box>
            {viewMode === "list" && <DiffList diffs={result.diffs} />}
            {viewMode === "side-by-side" && (
              <SideBySideView
                source={source}
                target={target}
                diffs={result.diffs}
              />
            )}
            {viewMode === "inline" && <DiffList diffs={result.diffs} />}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
