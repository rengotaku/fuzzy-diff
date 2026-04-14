import { create } from "zustand";
import type { ComparisonResult } from "verify-ai";
import type { DiffViewMode } from "@/utils/highlightMapper";

interface CompareState {
  source: string;
  target: string;
  result: ComparisonResult | null;
  isComparing: boolean;
  error: string | null;
  viewMode: DiffViewMode;
  setSource: (source: string) => void;
  setTarget: (target: string) => void;
  setResult: (result: ComparisonResult | null) => void;
  setIsComparing: (isComparing: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (viewMode: DiffViewMode) => void;
  reset: () => void;
}

const initialState = {
  source: "",
  target: "",
  result: null,
  isComparing: false,
  error: null,
  viewMode: "side-by-side" as DiffViewMode,
};

export const useCompareStore = create<CompareState>((set) => ({
  ...initialState,
  setSource: (source) => set({ source }),
  setTarget: (target) => set({ target }),
  setResult: (result) => set({ result }),
  setIsComparing: (isComparing) => set({ isComparing }),
  setError: (error) => set({ error }),
  setViewMode: (viewMode) => set({ viewMode }),
  reset: () => set(initialState),
}));
