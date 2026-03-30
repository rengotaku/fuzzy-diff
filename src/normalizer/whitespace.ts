/**
 * 空白正規化モジュール
 *
 * 処理順序:
 * 1. 改行コード統一 (\r\n / \r → \n)
 * 2. 各行のトリム（先頭・末尾の空白除去）
 * 3. 行内連続空白（スペース・タブ）を単一スペースに圧縮
 *
 * 注意: 全角スペース（U+3000）は変換しない（width.ts の担当）
 */
export function normalizeWhitespace(text: string): string {
  if (text === "") {
    return "";
  }

  // 1. 改行コード統一: \r\n → \n, \r → \n
  const unifiedNewlines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. 各行を処理
  const lines = unifiedNewlines.split("\n");
  const processedLines = lines.map((line) => {
    // 各行の先頭・末尾の半角空白・タブを除去
    const trimmed = line.replace(/^[\t ]+|[\t ]+$/g, "");
    // 行内連続空白（スペース・タブ）を単一スペースに圧縮
    return trimmed.replace(/[\t ]+/g, " ");
  });

  return processedLines.join("\n");
}
