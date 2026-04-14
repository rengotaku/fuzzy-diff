import type { DiffItem } from "verify-ai";

export interface HighlightSpan {
  start: number;
  end: number;
  diffType: "added" | "removed" | "changed";
  diffItem: DiffItem;
}

export interface TextSegment {
  text: string;
  highlight: HighlightSpan | null;
}

export type DiffViewMode = "list" | "side-by-side" | "inline";

/**
 * DiffItem[] と元テキストから HighlightSpan[] を生成する。
 * side に応じて sourceValue / targetValue を検索対象として使用する。
 * 同一値の重複出現は前回マッチ位置以降を検索して順序を保持する。
 */
export function findHighlightSpans(
  text: string,
  diffs: DiffItem[],
  side: "source" | "target"
): HighlightSpan[] {
  if (!text || diffs.length === 0) {
    return [];
  }

  const spans: HighlightSpan[] = [];
  // 値ごとの検索開始位置を追跡して重複に対応
  const searchFrom = new Map<string, number>();

  for (const diff of diffs) {
    const value = side === "source" ? diff.sourceValue : diff.targetValue;

    if (value === null || value === undefined || value === "") {
      continue;
    }

    const from = searchFrom.get(value) ?? 0;
    const idx = text.indexOf(value, from);

    if (idx === -1) {
      continue;
    }

    searchFrom.set(value, idx + value.length);

    spans.push({
      start: idx,
      end: idx + value.length,
      diffType: diff.type as "added" | "removed" | "changed",
      diffItem: diff,
    });
  }

  return spans.sort((a, b) => a.start - b.start);
}

/**
 * テキストを HighlightSpan[] に基づいてセグメントに分割する。
 * spans は start 昇順でソート済みであることを前提とする。
 */
export function splitToSegments(
  text: string,
  spans: HighlightSpan[]
): TextSegment[] {
  if (!text) {
    return [];
  }

  const sortedSpans = [...spans].sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const span of sortedSpans) {
    if (span.start > cursor) {
      segments.push({
        text: text.slice(cursor, span.start),
        highlight: null,
      });
    }

    segments.push({
      text: text.slice(span.start, span.end),
      highlight: span,
    });

    cursor = span.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      highlight: null,
    });
  }

  return segments;
}
