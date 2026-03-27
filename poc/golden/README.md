# Golden Files for Fuzzy Diff PoC

## 1. テキスト差分パターン (01-20)

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

### カテゴリ一覧

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

## 2. フォーマット総当たり比較 (formats/)

同じデータを6つのフォーマットで表現し、全ペア（36通り）で比較を行う。

### ソースファイル

| ファイル | フォーマット | 説明 |
|---|---|---|
| `formats/tsv.txt` | TSV | タブ区切りテーブル（ヘッダーあり） |
| `formats/json.txt` | JSON | オブジェクト配列（キー付き） |
| `formats/csv.txt` | CSV | カンマ区切りテーブル（ヘッダーあり） |
| `formats/yaml.txt` | YAML | キー:値リスト |
| `formats/array.txt` | Array | JSON二次元配列（ヘッダーなし） |
| `formats/ini.txt` | INI | セクション形式 |

### 期待結果マトリクス (`formats/matrix.json`)

`A->B` = Aをソース、Bをもう一方として比較した場合の期待結果。

|  | tsv | json | csv | yaml | array | ini |
|---|---|---|---|---|---|---|
| **tsv** | match | match | match | match | **mismatch** | match |
| **json** | match | match | match | match | **mismatch** | match |
| **csv** | match | match | match | match | **mismatch** | match |
| **yaml** | match | match | match | match | **mismatch** | match |
| **array** | **mismatch** | **mismatch** | **mismatch** | **mismatch** | match | **mismatch** |
| **ini** | match | match | match | match | **mismatch** | match |

`array` のみ mismatch になる理由: ヘッダー（キー名）が含まれないため、他フォーマットとの比較では情報（何の値か）が欠落している。
