/**
 * 全角半角変換モジュール
 *
 * NFKC 正規化を使用して以下を変換:
 * - 全角英数字 → 半角
 * - 全角記号 → 半角
 * - 半角カタカナ → 全角カタカナ（濁点・半濁点の結合含む）
 * - 全角スペース → 半角スペース
 */
export function normalizeWidth(text: string): string {
  if (text === "") {
    return "";
  }

  // NFKC 正規化で大部分をカバー
  return text.normalize("NFKC");
}
