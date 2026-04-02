# Phase 3 RED Tests: 差分の視覚的な確認

**Date**: 2026-04-03
**Status**: RED (FAIL verified)
**User Story**: US2 - 差分の視覚的な確認

## Summary

| Item | Value |
|------|-------|
| テスト作成数 | 29 |
| 失敗数 | 29（2ファイルとも import 解決エラーで全テスト失敗） |
| テストファイル | web/src/theme/diffColors.test.ts, web/src/components/DiffList.test.tsx |

## Failed Tests

| テストファイル | テストメソッド | 期待する動作 |
|-----------|-------------|-------------------|
| diffColors.test.ts | added に対して amber 系の色が定義されている | diffColors.added.background/text が文字列として存在 |
| diffColors.test.ts | removed に対して red 系の色が定義されている | diffColors.removed.background/text が文字列として存在 |
| diffColors.test.ts | changed に対して blue 系の色が定義されている | diffColors.changed.background/text が文字列として存在 |
| diffColors.test.ts | 各差分種別の背景色が互いに異なる | 3種別の background が全てユニーク |
| diffColors.test.ts | added, removed, changed の3種別が全て定義されている | Object.keys に3種別が含まれる |
| diffColors.test.ts | DiffItem.type の値で動的にアクセスできる | diffColors["added"] 等でアクセス可能 |
| diffColors.test.ts | diffColors オブジェクトが不変である | キーが3つのみ |
| diffColors.test.ts | 色の値が有効な CSS カラー文字列である | CSS カラーパターンにマッチ |
| DiffList.test.tsx | 差分リストが正しくレンダリングされる | パスが表示される |
| DiffList.test.tsx | 複数の差分が全て表示される | 3件の差分パスが全て表示 |
| DiffList.test.tsx | added の差分に識別可能な視覚的スタイルが適用される | data-diff-type='added' 属性が存在 |
| DiffList.test.tsx | removed の差分に識別可能な視覚的スタイルが適用される | data-diff-type='removed' 属性が存在 |
| DiffList.test.tsx | changed の差分に識別可能な視覚的スタイルが適用される | data-diff-type='changed' 属性が存在 |
| DiffList.test.tsx | 各差分種別が異なるスタイルで表示される | 3種別の data-diff-type が全て存在 |
| DiffList.test.tsx | added の差分に種別ラベルが表示される | "追加" または "added" テキスト |
| DiffList.test.tsx | removed の差分に種別ラベルが表示される | "欠落"/"削除" または "removed" テキスト |
| DiffList.test.tsx | changed の差分に種別ラベルが表示される | "変更" または "changed" テキスト |
| DiffList.test.tsx | added の差分で targetValue が表示される | targetValue のテキストが DOM に存在 |
| DiffList.test.tsx | removed の差分で sourceValue が表示される | sourceValue のテキストが DOM に存在 |
| DiffList.test.tsx | changed の差分で両方の値が表示される | sourceValue と targetValue の両方が DOM に存在 |
| DiffList.test.tsx | changed の差分で元の値と変更後の値が区別できる | data-value-type='source'/'target' 属性で区別 |
| DiffList.test.tsx | 差分が空の場合「差分なし」メッセージが表示される | "差分なし" テキストが表示 |
| DiffList.test.tsx | 差分が空の場合リストアイテムが表示されない | data-diff-type 要素が0件 |
| DiffList.test.tsx | 各差分のパスが表示される | パス文字列が DOM に表示 |
| DiffList.test.tsx | 特殊文字を含むパスが正しく表示される | Unicode パスが表示 |
| DiffList.test.tsx | 大量の差分（100件）を表示してもクラッシュしない | 100件の data-diff-type 要素 |
| DiffList.test.tsx | HTML 特殊文字を含む値がエスケープされて表示される | script タグがテキストとして表示 |
| DiffList.test.tsx | SQL 特殊文字を含む値を正しく表示する | SQL インジェクション文字列がテキスト表示 |
| DiffList.test.tsx | 空文字列/null 値のハンドリング | クラッシュせずに表示 |

## Implementation Hints

- `diffColors`: `{ added: { background, text }, removed: { background, text }, changed: { background, text } }` 形式のオブジェクトを export する。added=amber系、removed=red系、changed=blue系
- `DiffList`: props として `diffs: DiffItem[]` を受け取るコンポーネント。各差分アイテムに `data-diff-type` 属性を付与し、changed の場合は `data-value-type='source'`/`data-value-type='target'` で sourceValue/targetValue を区別する
- 空リスト時は「差分なし」メッセージを表示
- 差分種別ラベル: added="追加", removed="欠落"/"削除", changed="変更"

## npm test Output (excerpt)

```
FAIL src/theme/diffColors.test.ts
Error: Failed to resolve import "./diffColors" from "src/theme/diffColors.test.ts". Does the file exist?

FAIL src/components/DiffList.test.tsx
Error: Failed to resolve import "./DiffList" from "src/components/DiffList.test.tsx". Does the file exist?

Test Files  2 failed | 13 passed (15)
     Tests  85 passed (85)
```
