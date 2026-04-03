import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { theme } from "@/theme";
import { CompareForm } from "@/components/CompareForm";
import { ResultSummary } from "@/components/ResultSummary";
import { DiffList } from "@/components/DiffList";
import { useCompareStore } from "@/stores/compareStore";

function App() {
  const result = useCompareStore((state) => state.result);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <CompareForm />
        <ResultSummary />
        {result && <DiffList diffs={result.diffs} />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
