# Golden Files for Fuzzy Diff PoC

各ファイルは以下の構造を持つJSONファイル:

```json
{
  "id": "ユニークID",
  "name": "テストケース名",
  "description": "何を検証するか",
  "category": "カテゴリ",
  "expected_match": true/false,
  "expected_similarity": "high/medium/low",
  "source": "元情報テキスト",
  "ai_output": "AI生成テキスト"
}
```

## カテゴリ一覧

| カテゴリ | 説明 | ファイル |
|---|---|---|
| exact | 完全一致 | 01 |
| whitespace | 空白・改行の違い | 02 |
| normalize | 全角半角・カタカナひらがな | 03, 04 |
| order | 順序の違い | 05, 06 |
| wording | 表現・言い回しの違い | 07, 08 |
| summary | 要約・圧縮 | 09, 10 |
| partial | 部分一致・欠落 | 11, 12 |
| extra | 余分な項目の追加 | 13 |
| format | フォーマット変換 | 14, 15 |
| number | 数値表記の揺れ | 16 |
| combined | 複数パターンの組み合わせ | 17, 18, 19 |
| hallucination | AIの幻覚（不一致） | 20 |
