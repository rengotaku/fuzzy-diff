// 構造化データ比較: ParsedRecord同士を順序無視で比較

import type { DiffItem, ParsedRecord } from "../types.js";
import { token_set_ratio } from "fuzzball/lite";

interface StructuredResult {
  readonly score: number;
  readonly diffs: readonly DiffItem[];
}

const FUZZ_OPTIONS = {
  full_process: true,
  force_ascii: false,
} as const;

/**
 * 2つのParsedRecordを構造化比較する。
 * - ヘッダーの有無をチェック（片方のみ欠落 → 低スコア）
 * - 行を最適マッチングで対応付け（順序無視）
 * - 値単位でfuzzy比較してスコアを算出
 */
export function compareStructured(
  source: ParsedRecord,
  target: ParsedRecord,
): StructuredResult {
  // ヘッダー欠落チェック
  if (
    (source.headers !== null && target.headers === null) ||
    (source.headers === null && target.headers !== null)
  ) {
    return {
      score: 0.4,
      diffs: [
        {
          type: "removed",
          path: "headers",
          sourceValue: source.headers ? source.headers.join(",") : null,
          targetValue: target.headers ? target.headers.join(",") : null,
        },
      ],
    };
  }

  // 両方ヘッダーなし → 値のみ比較
  if (source.headers === null && target.headers === null) {
    return compareRows(source.rows, target.rows);
  }

  // 両方ヘッダーあり → カラム完全性チェック + 行マッチング
  const sourceHeaders = new Set(source.headers!);
  const targetHeaders = new Set(target.headers!);

  const missingColumns: string[] = [];
  for (const h of sourceHeaders) {
    if (!targetHeaders.has(h)) missingColumns.push(h);
  }
  const extraColumns: string[] = [];
  for (const h of targetHeaders) {
    if (!sourceHeaders.has(h)) extraColumns.push(h);
  }

  // カラム欠落がある場合はペナルティ
  if (missingColumns.length > 0 || extraColumns.length > 0) {
    const columnScore = 1 - (missingColumns.length + extraColumns.length) /
      (sourceHeaders.size + extraColumns.length);

    const rowResult = compareRows(source.rows, target.rows);
    const penalizedScore = Math.round(rowResult.score * columnScore * 100) / 100;

    const columnDiffs: DiffItem[] = [
      ...missingColumns.map((col): DiffItem => ({
        type: "removed",
        path: `column:${col}`,
        sourceValue: col,
        targetValue: null,
      })),
      ...extraColumns.map((col): DiffItem => ({
        type: "added",
        path: `column:${col}`,
        sourceValue: null,
        targetValue: col,
      })),
    ];

    return {
      score: penalizedScore,
      diffs: [...columnDiffs, ...rowResult.diffs],
    };
  }

  return compareRows(source.rows, target.rows);
}

/**
 * 行を順序無視で最適マッチングし、スコアを算出する。
 */
function compareRows(
  sourceRows: readonly Record<string, string>[],
  targetRows: readonly Record<string, string>[],
): StructuredResult {
  if (sourceRows.length === 0 && targetRows.length === 0) {
    return { score: 1.0, diffs: [] };
  }
  if (sourceRows.length === 0 || targetRows.length === 0) {
    return {
      score: 0,
      diffs: [
        {
          type: sourceRows.length === 0 ? "added" : "removed",
          path: "rows",
          sourceValue: sourceRows.length > 0 ? JSON.stringify(sourceRows) : null,
          targetValue: targetRows.length > 0 ? JSON.stringify(targetRows) : null,
        },
      ],
    };
  }

  // 各ソース行に対して最もマッチするターゲット行を見つける（greedy matching）
  const usedTargetIndices = new Set<number>();
  const rowScores: number[] = [];
  const diffs: DiffItem[] = [];

  for (const sourceRow of sourceRows) {
    let bestScore = -1;
    let bestIndex = -1;

    for (let j = 0; j < targetRows.length; j++) {
      if (usedTargetIndices.has(j)) continue;
      const score = compareRecords(sourceRow, targetRows[j]!);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = j;
      }
    }

    if (bestIndex >= 0) {
      usedTargetIndices.add(bestIndex);
      rowScores.push(bestScore);

      if (bestScore < 1.0) {
        const targetRow = targetRows[bestIndex]!;
        const rowDiffs = diffRecords(sourceRow, targetRow);
        diffs.push(...rowDiffs);
      }
    } else {
      rowScores.push(0);
      diffs.push({
        type: "removed",
        path: "",
        sourceValue: JSON.stringify(sourceRow),
        targetValue: null,
      });
    }
  }

  // 未マッチのターゲット行 → 追加扱い
  for (let j = 0; j < targetRows.length; j++) {
    if (!usedTargetIndices.has(j)) {
      diffs.push({
        type: "added",
        path: "",
        sourceValue: null,
        targetValue: JSON.stringify(targetRows[j]),
      });
    }
  }

  // スコア計算: マッチした行のスコア平均、行数差もペナルティ
  const maxRows = Math.max(sourceRows.length, targetRows.length);
  const totalScore = rowScores.reduce((sum, s) => sum + s, 0);
  const score = Math.round((totalScore / maxRows) * 100) / 100;

  return { score, diffs };
}

/**
 * 2つのレコードを値レベルで比較する。
 * @returns 0.0-1.0 のスコア
 */
function compareRecords(
  a: Record<string, string>,
  b: Record<string, string>,
): number {
  const aStr = serializeRecord(a);
  const bStr = serializeRecord(b);
  return token_set_ratio(aStr, bStr, FUZZ_OPTIONS) / 100;
}

/**
 * 2つのレコード間の差分を生成する。
 */
function diffRecords(
  source: Record<string, string>,
  target: Record<string, string>,
): DiffItem[] {
  const diffs: DiffItem[] = [];
  const allKeys = new Set([...Object.keys(source), ...Object.keys(target)]);

  for (const key of allKeys) {
    const sv = source[key];
    const tv = target[key];

    if (sv === undefined) {
      diffs.push({ type: "added", path: key, sourceValue: null, targetValue: tv ?? null });
    } else if (tv === undefined) {
      diffs.push({ type: "removed", path: key, sourceValue: sv, targetValue: null });
    } else if (sv !== tv) {
      diffs.push({ type: "changed", path: key, sourceValue: sv, targetValue: tv });
    }
  }

  return diffs;
}

/**
 * レコードの値を比較用の文字列に変換する。
 */
function serializeRecord(record: Record<string, string>): string {
  return Object.values(record).join(" ");
}
