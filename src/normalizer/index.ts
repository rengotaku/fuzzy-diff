// 正規化パイプライン: whitespace → width → kana → number

import type { NormalizedText } from "../types.js";
import { normalizeWhitespace } from "./whitespace.js";
import { normalizeWidth } from "./width.js";
import { kanaToHiragana } from "./kana.js";
import { normalizeNumber } from "./number.js";

export { normalizeWhitespace } from "./whitespace.js";
export { normalizeWidth } from "./width.js";
export { kanaToHiragana } from "./kana.js";
export { normalizeNumber } from "./number.js";

export function normalize(text: string): NormalizedText {
  const step1 = normalizeWhitespace(text);
  const step2 = normalizeWidth(step1);
  const step3 = kanaToHiragana(step2);
  const step4 = normalizeNumber(step3);

  return { original: text, normalized: step4 };
}
