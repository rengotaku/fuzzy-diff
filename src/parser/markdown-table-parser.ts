// Markdownパイプテーブルパーサー（GFM仕様準拠）

import type { ParsedRecord } from "../types.js";

/** 区切り行セルの判定パターン: :?-+:? */
const DELIMITER_CELL = /^\s*:?-+:?\s*$/;

/**
 * Markdownパイプテーブルをパースして構造化中間表現に変換する。
 *
 * 対応:
 * - 基本パイプテーブル（ヘッダー + 区切り行 + データ行）
 * - アラインメント（:---, :---:, ---:）
 * - 先頭/末尾パイプの省略
 * - エスケープされたパイプ（\|）
 * - 空セル、カラム数不一致の補完/切り捨て
 */
export function parseMarkdownTable(text: string): ParsedRecord {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return { headers: null, rows: [] };
  }

  // 2行目が区切り行かチェック
  const delimiterCells = splitRow(lines[1]!);
  if (!delimiterCells.every((cell) => DELIMITER_CELL.test(cell))) {
    return { headers: null, rows: [] };
  }

  // 1行目がヘッダー
  const headers = splitRow(lines[0]!).map((h) => h.trim());
  if (headers.length === 0) {
    return { headers: null, rows: [] };
  }

  // 3行目以降がデータ行
  const rows: Record<string, string>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = splitRow(lines[i]!);
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]!] = (cells[j] ?? "").trim();
    }
    rows.push(record);
  }

  return { headers, rows };
}

/**
 * パイプで行を分割する。エスケープされたパイプ（\|）は分割しない。
 * 先頭/末尾のパイプは除去する。
 */
function splitRow(line: string): string[] {
  // エスケープされたパイプを一時的にプレースホルダに置換
  const placeholder = "\x00PIPE\x00";
  const escaped = line.replace(/\\\|/g, placeholder);

  // パイプで分割
  let cells = escaped.split("|");

  // 先頭/末尾の空セルを除去（パイプで囲まれている場合）
  if (cells.length > 0 && cells[0]!.trim() === "") {
    cells = cells.slice(1);
  }
  if (cells.length > 0 && cells[cells.length - 1]!.trim() === "") {
    cells = cells.slice(0, -1);
  }

  // プレースホルダを元のパイプに戻す
  return cells.map((c) => c.replace(/\x00PIPE\x00/g, "|"));
}
