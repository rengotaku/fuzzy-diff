// T002: 共通型定義

export interface ComparisonInput {
  readonly source: string;
  readonly target: string;
}

export interface NormalizedText {
  readonly original: string;
  readonly normalized: string;
}

export type FormatType = "json" | "csv" | "tsv" | "yaml" | "ini" | "array" | "plain";

export interface DetectedFormat {
  readonly type: FormatType;
  readonly confidence: number;
}

export interface ParsedRecord {
  readonly headers: readonly string[] | null;
  readonly rows: readonly Record<string, string>[];
}

export interface DiffItem {
  readonly type: "added" | "removed" | "changed";
  readonly path: string;
  readonly sourceValue: string | null;
  readonly targetValue: string | null;
}

export interface ComparisonResult {
  readonly score: number;
  readonly match: boolean;
  readonly diffs: readonly DiffItem[];
  readonly sourceFormat: DetectedFormat;
  readonly targetFormat: DetectedFormat;
}

export interface CompareOptions {
  readonly threshold?: number;
  readonly normalize?: boolean;
  readonly orderSensitive?: boolean;
}
