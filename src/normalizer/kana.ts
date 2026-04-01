/**
 * カタカナ→ひらがな変換モジュール
 *
 * Unicode コードポイント範囲変換:
 * - カタカナ U+30A1-U+30F6 → ひらがな U+3041-U+3096 (オフセット 0x60)
 * - ヴ (U+30F4) → ゔ (U+3094)
 * - 長音記号 ー (U+30FC) は変換対象外
 */

const KATAKANA_START = 0x30a1; // ァ
const KATAKANA_END = 0x30f6; // ヶ
const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;

export function kanaToHiragana(text: string): string {
  if (text === "") {
    return "";
  }

  let result = "";
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code >= KATAKANA_START && code <= KATAKANA_END) {
      result += String.fromCodePoint(code - KATAKANA_TO_HIRAGANA_OFFSET);
    } else {
      result += char;
    }
  }

  return result;
}
