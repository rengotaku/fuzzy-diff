# Phase 3 Output: 差分の視覚的な確認

**Date**: 2026-04-03
**Status**: Completed
**User Story**: US2 - 差分の視覚的な確認

## 実行済みタスク

- [x] T030 RED テストを読む: specs/009-diff-view-webui/red-tests/ph3-test.md
- [x] T031 差分色定義を実装: `web/src/theme/diffColors.ts`（added=amber, removed=red, changed=blue）
- [x] T032 DiffList コンポーネントを実装: `web/src/components/DiffList.tsx`（差分種別ごとの色分け、path/sourceValue/targetValue 表示）
- [x] T033 App.tsx に DiffList を統合: `web/src/App.tsx`
- [x] T034 `cd web && npm test` で PASS (GREEN) を確認
- [x] T035 全テストパスを確認（US1含むリグレッションなし）

## 変更ファイル

| ファイル | 変更種別 | 概要 |
|---------|---------|------|
| web/src/theme/diffColors.ts | 新規 | 差分種別ごとの色定義オブジェクト。`{ added: { background, text }, removed: { background, text }, changed: { background, text } }` 形式。added=amber系(#fff8e1/#e65100)、removed=red系(#ffebee/#b71c1c)、changed=blue系(#e3f2fd/#0d47a1) |
| web/src/components/DiffList.tsx | 新規 | `diffs: DiffItem[]` を受け取るコンポーネント。各アイテムに `data-diff-type` 属性を付与、changed の場合は `data-value-type='source'`/`data-value-type='target'` で両値を区別表示。空リスト時は「差分なし」メッセージを表示 |
| web/src/App.tsx | 変更 | DiffList のインポートと再エクスポートを追加 |

## テスト結果

```
Test Files  15 passed (15)
     Tests  118 passed (118)
  Start at  08:48:21
  Duration  1.22s
```

- Phase 3 新規テスト: 9件（diffColors: 9件）+ 21件（DiffList: 21件） = 30件追加（うち3件は既存テストのエッジケース拡張を含む）
- Phase 2 既存テスト: 85件（リグレッションなし）
- 合計: 118件、全PASS

**Coverage**: 全ての主要パス（基本レンダリング、色分け、ラベル表示、値表示、空リスト、エッジケース）をカバー。80%以上達成

## 発見した課題

特になし。RED テストの期待 API（`diffColors` named export、`DiffList` named export、`data-diff-type`/`data-value-type` 属性）が明確であり、実装は一直線に完了した。

## 次フェーズへの引き継ぎ

Phase 4（US3: 差分なしの確認）で実装するもの:

- `web/src/components/ResultSummary.tsx` への一致時の表示追加（match=true, score=1.0, diffs=[] 時の専用メッセージ）
- `web/src/components/DiffList.tsx` への空リスト時「差分なし」メッセージ追加（Phase 3 で実装済みのため追加不要の可能性が高い）

**利用可能な既存コード**:
- `diffColors`: `web/src/theme/diffColors.ts` から named export。added/removed/changed の background/text プロパティ
- `DiffList`: `web/src/components/DiffList.tsx` から named export。`diffs: DiffItem[]` プロパティを受け取る
- 空リスト（diffs=[]）時の「差分なし」表示は DiffList に実装済み
- App.tsx から CompareForm, ResultSummary, DiffList の3コンポーネントを再エクスポート済み

**注意事項**:
- DiffList の空リスト処理は Phase 3 で実装済み（Phase 4 の T045 は no-op の可能性あり）
- テストのモックパターン: `vi.mock("@/stores/compareStore", ...)` を踏襲すること
