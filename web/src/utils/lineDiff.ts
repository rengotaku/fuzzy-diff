import type { DiffItem } from "verify-ai";
import type { HighlightSpan } from "./highlightMapper";
import { findHighlightSpans, splitToSegments } from "./highlightMapper";
import type { TextSegment } from "./highlightMapper";

export type LineType =
  | "unchanged"
  | "removed"
  | "added"
  | "changed-source"
  | "changed-target";

export interface DiffLine {
  readonly text: string;
  readonly type: LineType;
  readonly segments: TextSegment[];
  readonly lineNumber: number;
}

/**
 * source と target を行単位で比較し、レコード単位でペアリングされた行リストを返す。
 *
 * CSV vs JSON など異フォーマットでも、DiffItem の値をブリッジにして
 * 同じレコードの行同士を対にして表示する。
 */
export function buildUnifiedLines(
  source: string,
  target: string,
  diffs: readonly DiffItem[]
): DiffLine[] {
  if (!source && !target) return [];

  const sourceLines = source ? source.split("\n") : [];
  const targetLines = target ? target.split("\n") : [];

  // ハイライト span を計算
  const sourceSpans = source ? findHighlightSpans(source, [...diffs], "source") : [];
  const targetSpans = target ? findHighlightSpans(target, [...diffs], "target") : [];

  const sourceLineSpans = assignSpansToLines(source, sourceLines, sourceSpans);
  const targetLineSpans = assignSpansToLines(target, targetLines, targetSpans);

  // 構造文字のみの行（[], {}, 空行）を除外
  const sourceIndices = sourceLines
    .map((_, i) => i)
    .filter((i) => !isStructuralLine(sourceLines[i]));
  const targetIndices = targetLines
    .map((_, i) => i)
    .filter((i) => !isStructuralLine(targetLines[i]));
  const pairs = pairRecordLines(
    sourceLines,
    targetLines,
    sourceIndices,
    targetIndices,
    diffs
  );

  // 結果を組み立て
  const result: DiffLine[] = [];
  let lineNumber = 1;

  for (const pair of pairs) {
    if (pair.sourceIdx !== null && pair.targetIdx !== null) {
      const sSpans = sourceLineSpans[pair.sourceIdx];
      const tSpans = targetLineSpans[pair.targetIdx];
      const hasDiff = sSpans.length > 0 || tSpans.length > 0;

      if (hasDiff) {
        result.push(
          makeDiffLine(
            sourceLines[pair.sourceIdx],
            "changed-source",
            sSpans,
            lineNumber++
          )
        );
        result.push(
          makeDiffLine(
            targetLines[pair.targetIdx],
            "changed-target",
            tSpans,
            lineNumber++
          )
        );
      } else if (sourceLines[pair.sourceIdx] === targetLines[pair.targetIdx]) {
        // 完全一致
        result.push(
          makeDiffLine(sourceLines[pair.sourceIdx], "unchanged", [], lineNumber++)
        );
      } else {
        // テキストは違うが差分値なし（フォーマット違いだが値は同じ）→ 両方表示
        result.push(
          makeDiffLine(sourceLines[pair.sourceIdx], "changed-source", [], lineNumber++)
        );
        result.push(
          makeDiffLine(targetLines[pair.targetIdx], "changed-target", [], lineNumber++)
        );
      }
    } else if (pair.sourceIdx !== null) {
      const spans = sourceLineSpans[pair.sourceIdx];
      result.push(
        makeDiffLine(sourceLines[pair.sourceIdx], "removed", spans, lineNumber++)
      );
    } else if (pair.targetIdx !== null) {
      const spans = targetLineSpans[pair.targetIdx];
      result.push(
        makeDiffLine(targetLines[pair.targetIdx], "added", spans, lineNumber++)
      );
    }
  }

  return result;
}

interface LinePair {
  readonly sourceIdx: number | null;
  readonly targetIdx: number | null;
}

/**
 * DiffItem の値をブリッジにしてレコード行をペアリングする。
 * 1. DiffItem の sourceValue/targetValue を含む行同士をペアにする
 * 2. 残った行は共通する部分文字列で最良マッチを探す
 */
function pairRecordLines(
  sourceLines: string[],
  targetLines: string[],
  sourceIndices: number[],
  targetIndices: number[],
  diffs: readonly DiffItem[]
): LinePair[] {
  const usedSource = new Set<number>();
  const usedTarget = new Set<number>();
  const pairMap = new Map<number, number>(); // sourceIdx → targetIdx

  // Step 1: DiffItem の値でペアリング
  for (const diff of diffs) {
    const sv = diff.sourceValue;
    const tv = diff.targetValue;

    let si: number | null = null;
    let ti: number | null = null;

    if (sv) {
      for (const idx of sourceIndices) {
        if (!usedSource.has(idx) && sourceLines[idx].includes(sv)) {
          si = idx;
          break;
        }
      }
    }

    if (tv) {
      for (const idx of targetIndices) {
        if (!usedTarget.has(idx) && targetLines[idx].includes(tv)) {
          ti = idx;
          break;
        }
      }
    }

    if (si !== null && ti !== null && !pairMap.has(si)) {
      pairMap.set(si, ti);
      usedSource.add(si);
      usedTarget.add(ti);
    }
  }

  // Step 2: 残った行を共有値でペアリング
  for (const si of sourceIndices) {
    if (usedSource.has(si)) continue;
    const sTokens = extractTokens(sourceLines[si]);
    if (sTokens.length === 0) continue;

    let bestTi: number | null = null;
    let bestScore = 0;

    for (const ti of targetIndices) {
      if (usedTarget.has(ti)) continue;
      const tTokens = extractTokens(targetLines[ti]);
      const shared = countSharedTokens(sTokens, tTokens);
      if (shared > bestScore) {
        bestScore = shared;
        bestTi = ti;
      }
    }

    if (bestTi !== null && bestScore > 0) {
      pairMap.set(si, bestTi);
      usedSource.add(si);
      usedTarget.add(bestTi);
    }
  }

  // Step 3: ペアリスト生成（source の出現順）
  const result: LinePair[] = [];
  const emittedTarget = new Set<number>();

  for (const si of sourceIndices) {
    const ti = pairMap.get(si);
    if (ti !== undefined) {
      result.push({ sourceIdx: si, targetIdx: ti });
      emittedTarget.add(ti);
    } else {
      result.push({ sourceIdx: si, targetIdx: null });
    }
  }

  // 残りの target 行（ペアなし）
  for (const ti of targetIndices) {
    if (!emittedTarget.has(ti)) {
      result.push({ sourceIdx: null, targetIdx: ti });
    }
  }

  return result;
}

/** JSON/YAML の構造文字のみの行かどうか判定する */
function isStructuralLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === "" || /^[[\]{},\s]*$/.test(trimmed);
}

/** 行からトークン（値）を抽出する */
function extractTokens(line: string): string[] {
  const tokens: string[] = [];

  // "value" 形式
  const quoted = line.matchAll(/"([^"]+)"/g);
  for (const m of quoted) {
    tokens.push(m[1]);
  }

  // CSV/TSV の値（カンマ/タブ区切り）
  const csvParts = line
    .split(/[,\t]/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of csvParts) {
    const clean = part.replace(/^["'{[\s]+|["'}\]\s]+$/g, "");
    if (clean && !tokens.includes(clean)) {
      tokens.push(clean);
    }
  }

  return tokens.filter((t) => t.length > 0);
}

/** 2つのトークン集合の共通要素数を返す */
function countSharedTokens(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

/** 各行に属する HighlightSpan を振り分け、行内オフセットに変換する */
function assignSpansToLines(
  fullText: string,
  lines: string[],
  spans: HighlightSpan[]
): HighlightSpan[][] {
  if (!fullText) return lines.map(() => []);

  const lineOffsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push(offset);
    offset += line.length + 1; // +1 for \n
  }

  return lines.map((line, i) => {
    const lineStart = lineOffsets[i];
    const lineEnd = lineStart + line.length;
    return spans
      .filter((s) => s.start >= lineStart && s.end <= lineEnd)
      .map((s) => ({
        ...s,
        start: s.start - lineStart,
        end: s.end - lineStart,
      }));
  });
}

function makeDiffLine(
  text: string,
  type: LineType,
  spans: HighlightSpan[],
  lineNumber: number
): DiffLine {
  return {
    text,
    type,
    segments: splitToSegments(text, spans),
    lineNumber,
  };
}

// --- Phase 4: US3 Side-by-Side ペア生成 ---

export interface SideBySideLinePair {
  readonly left: {
    readonly lineNumber: number | null;
    readonly text: string;
    readonly type: string;
    readonly isPlaceholder: boolean;
  } | null;
  readonly right: {
    readonly lineNumber: number | null;
    readonly text: string;
    readonly type: string;
    readonly isPlaceholder: boolean;
  } | null;
  readonly leftLineNumber: number | null;
  readonly rightLineNumber: number | null;
}

/**
 * source と target から Side-by-Side 表示用の行ペアを生成する。
 * 片方にのみ行が存在する場合はプレースホルダー（isPlaceholder: true, lineNumber: null）を挿入する。
 * 左右の行番号はそれぞれ独立した 1 から始まる連番を付与する。
 */
export function buildSideBySidePairs(
  source: string,
  target: string,
  diffs: readonly DiffItem[]
): SideBySideLinePair[] {
  if (!source && !target) return [];

  const sourceLines = source ? source.split("\n") : [];
  const targetLines = target ? target.split("\n") : [];

  // source のみの場合: 全行が left、right はプレースホルダー
  if (!source) {
    let rightLineNumber = 0;
    return targetLines.map((line) => {
      rightLineNumber++;
      const right = {
        lineNumber: rightLineNumber,
        text: line,
        type: "added" as const,
        isPlaceholder: false,
      };
      return {
        left: {
          lineNumber: null,
          text: "",
          type: "unchanged" as const,
          isPlaceholder: true,
        },
        right,
        leftLineNumber: null,
        rightLineNumber: rightLineNumber,
      };
    });
  }

  if (!target) {
    let leftLineNumber = 0;
    return sourceLines.map((line) => {
      leftLineNumber++;
      const left = {
        lineNumber: leftLineNumber,
        text: line,
        type: "removed" as const,
        isPlaceholder: false,
      };
      return {
        left,
        right: {
          lineNumber: null,
          text: "",
          type: "unchanged" as const,
          isPlaceholder: true,
        },
        leftLineNumber: leftLineNumber,
        rightLineNumber: null,
      };
    });
  }

  // 構造文字のみの行を除外してペアリング
  const sourceIndices = sourceLines
    .map((_, i) => i)
    .filter((i) => !isStructuralLine(sourceLines[i]));
  const targetIndices = targetLines
    .map((_, i) => i)
    .filter((i) => !isStructuralLine(targetLines[i]));

  const pairs = pairRecordLines(
    sourceLines,
    targetLines,
    sourceIndices,
    targetIndices,
    diffs
  );

  // 結果を組み立て（左右独立行番号）
  const result: SideBySideLinePair[] = [];
  let leftLineNumber = 0;
  let rightLineNumber = 0;

  for (const pair of pairs) {
    if (pair.sourceIdx !== null && pair.targetIdx !== null) {
      leftLineNumber++;
      rightLineNumber++;
      result.push({
        left: {
          lineNumber: leftLineNumber,
          text: sourceLines[pair.sourceIdx],
          type: "unchanged",
          isPlaceholder: false,
        },
        right: {
          lineNumber: rightLineNumber,
          text: targetLines[pair.targetIdx],
          type: "unchanged",
          isPlaceholder: false,
        },
        leftLineNumber: leftLineNumber,
        rightLineNumber: rightLineNumber,
      });
    } else if (pair.sourceIdx !== null) {
      // source のみ: right はプレースホルダー
      leftLineNumber++;
      result.push({
        left: {
          lineNumber: leftLineNumber,
          text: sourceLines[pair.sourceIdx],
          type: "removed",
          isPlaceholder: false,
        },
        right: {
          lineNumber: null,
          text: "",
          type: "unchanged",
          isPlaceholder: true,
        },
        leftLineNumber: leftLineNumber,
        rightLineNumber: null,
      });
    } else if (pair.targetIdx !== null) {
      // target のみ: left はプレースホルダー
      rightLineNumber++;
      result.push({
        left: {
          lineNumber: null,
          text: "",
          type: "unchanged",
          isPlaceholder: true,
        },
        right: {
          lineNumber: rightLineNumber,
          text: targetLines[pair.targetIdx],
          type: "added",
          isPlaceholder: false,
        },
        leftLineNumber: null,
        rightLineNumber: rightLineNumber,
      });
    }
  }

  return result;
}
