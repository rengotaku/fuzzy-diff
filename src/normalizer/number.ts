/**
 * 数値表記正規化モジュール
 *
 * 処理内容:
 * 1. 日本語数量表現の展開（万/億/兆/千）
 * 2. ¥/￥記号の除去
 * 3. 数値中のカンマ除去（日付のカンマは除外）
 */

/**
 * 「1億2500万円」のような複合数量表現を展開する
 *
 * 例: "1億2500万円" → "125000000円"
 */
function expandJapaneseNumbers(text: string): string {
  // 複合パターン: 数値+億+数値+万 etc.
  // まず複合表現を処理（例: 1億2500万）
  const compoundPattern =
    /(\d+(?:\.\d+)?)兆(?:(\d+(?:\.\d+)?)億)?(?:(\d+(?:\.\d+)?)万)?(?:(\d+(?:\.\d+)?)千)?|(\d+(?:\.\d+)?)億(?:(\d+(?:\.\d+)?)万)?(?:(\d+(?:\.\d+)?)千)?|(\d+(?:\.\d+)?)万(?:(\d+(?:\.\d+)?)千)?|(\d+(?:\.\d+)?)千/g;

  return text.replace(compoundPattern, (...args: readonly string[]) => {
    let total = 0;

    // 兆グループ: args[1]=兆, args[2]=億, args[3]=万, args[4]=千
    if (args[1] !== undefined) {
      total += parseFloat(args[1]) * 1_000_000_000_000;
      if (args[2] !== undefined) {
        total += parseFloat(args[2]) * 100_000_000;
      }
      if (args[3] !== undefined) {
        total += parseFloat(args[3]) * 10_000;
      }
      if (args[4] !== undefined) {
        total += parseFloat(args[4]) * 1_000;
      }
    }
    // 億グループ: args[5]=億, args[6]=万, args[7]=千
    else if (args[5] !== undefined) {
      total += parseFloat(args[5]) * 100_000_000;
      if (args[6] !== undefined) {
        total += parseFloat(args[6]) * 10_000;
      }
      if (args[7] !== undefined) {
        total += parseFloat(args[7]) * 1_000;
      }
    }
    // 万グループ: args[8]=万, args[9]=千
    else if (args[8] !== undefined) {
      total += parseFloat(args[8]) * 10_000;
      if (args[9] !== undefined) {
        total += parseFloat(args[9]) * 1_000;
      }
    }
    // 千グループ: args[10]=千
    else if (args[10] !== undefined) {
      total += parseFloat(args[10]) * 1_000;
    }

    return String(total);
  });
}

/**
 * ¥ / ￥ 記号を除去する
 * 直後の数値と合わせて処理（¥12,500 → 12,500）
 */
function removeYenSymbol(text: string): string {
  return text.replace(/[¥￥]/g, "");
}

/**
 * 数値中のカンマを除去する
 * 日付パターン（"March 29, 2026" のようなテキスト中のカンマ）は除外
 *
 * 数値カンマのパターン: 数字,数字 の形（3桁区切り）
 */
function removeNumericCommas(text: string): string {
  // 数値中のカンマを除去: 1桁以上の数字 + (,3桁数字)+ のパターン
  return text.replace(/(\d),(\d{3})/g, (_match, before, after) => {
    return `${before}${after}`;
  });
}

export function normalizeNumber(text: string): string {
  if (text === "") {
    return "";
  }

  // 1. 日本語数量表現の展開
  let result = expandJapaneseNumbers(text);

  // 2. ¥/￥記号の除去
  result = removeYenSymbol(result);

  // 3. 数値中のカンマ除去（繰り返し適用して全桁区切りを除去）
  let previous = "";
  while (previous !== result) {
    previous = result;
    result = removeNumericCommas(result);
  }

  return result;
}
