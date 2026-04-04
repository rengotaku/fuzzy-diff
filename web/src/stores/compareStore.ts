import { create } from "zustand";
import type { ComparisonResult } from "verify-ai";

interface CompareState {
  source: string;
  target: string;
  result: ComparisonResult | null;
  isComparing: boolean;
  error: string | null;
  setSource: (source: string) => void;
  setTarget: (target: string) => void;
  setResult: (result: ComparisonResult | null) => void;
  setIsComparing: (isComparing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  source: "",
  target: "",
  result: null,
  isComparing: false,
  error: null,
};

export const useCompareStore = create<CompareState>((set) => ({
  ...initialState,
  setSource: (source) => set({ source }),
  setTarget: (target) => set({ target }),
  setResult: (result) => set({ result }),
  setIsComparing: (isComparing) => set({ isComparing }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
