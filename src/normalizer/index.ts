// T004: 正規化モジュールのエントリポイント（スタブ）

import type { NormalizedText } from "../types.js";

export function normalize(text: string): NormalizedText {
  return { original: text, normalized: text };
}
