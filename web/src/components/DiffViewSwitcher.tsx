import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useCompareStore } from "@/stores/compareStore";
import type { DiffViewMode } from "@/utils/highlightMapper";

export function DiffViewSwitcher() {
  const viewMode = useCompareStore((state) => state.viewMode);
  const setViewMode = useCompareStore((state) => state.setViewMode);

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: DiffViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={handleChange}
      size="small"
    >
      <ToggleButton value="list">リスト</ToggleButton>
      <ToggleButton value="side-by-side">side-by-side</ToggleButton>
      <ToggleButton value="inline">インライン</ToggleButton>
    </ToggleButtonGroup>
  );
}
