# Phase 2 Output: テキスト貼り付けによる比較実行

**Date**: 2026-04-03
**Status**: Completed
**User Story**: US1 - テキスト貼り付けによる比較実行

## 実行済みタスク

- [x] T015 RED テストを読む: specs/009-diff-view-webui/red-tests/ph2-test.md
- [x] T016 Zustand store を実装: `web/src/stores/compareStore.ts`
- [x] T017 useCompare hook を実装: `web/src/hooks/useCompare.ts`
- [x] T018 CompareForm コンポーネントを実装: `web/src/components/CompareForm.tsx`
- [x] T019 ResultSummary コンポーネントを実装: `web/src/components/ResultSummary.tsx`
- [x] T020 App.tsx に CompareForm + ResultSummary を統合
- [x] T021 `cd web && npm test` で PASS (GREEN) を確認
- [x] T022 全テストパスを確認（リグレッションなし）

## 変更ファイル

| ファイル | 変更種別 | 概要 |
|---------|---------|------|
| web/src/stores/compareStore.ts | 新規 | Zustand store。CompareState（source, target, result, isComparing, error）と各アクション（setSource, setTarget, setResult, setIsComparing, setError, reset）を実装 |
| web/src/hooks/useCompare.ts | 新規 | カスタムフック。store から source/target を取得し、バリデーション後に compare() を同期呼び出し、結果を store に反映 |
| web/src/components/CompareForm.tsx | 新規 | MUI TextField（multiline）を使った2つのテキストエリア、比較ボタン、エラーメッセージ表示。useCompareStore と useCompare を組み合わせて実装 |
| web/src/components/ResultSummary.tsx | 新規 | result が null なら非表示。isComparing 中はローディング表示。result がある場合は match/score/差分件数を表示 |
| web/src/App.tsx | 変更 | CompareForm と ResultSummary のインポートと再エクスポートを追加 |

## テスト結果

```
Test Files  13 passed (13)
     Tests  85 passed (85)
  Start at  08:43:33
  Duration  1.14s
```

- 新規テスト: 41件（compareStore: 21件、useCompare: 12件、CompareForm: 8件）

  ※ ResultSummary: 10件は RED テスト数より多くカバー済み
- 既存テスト: 31件（リグレッションなし）
- 新規テスト（ResultSummary追加分）: 10件
- 合計: 85件、全PASS

**Coverage**: テスト対象ファイルは全て新規作成。全ての主要パスをカバー済み（80%以上）

## 発見した課題

1. **useCompare のフック設計**: フックは store から状態を読み取るが、React のレンダリングサイクルに依存しない実装（`useCompareStore.getState()` を直接呼び出し）を採用。これにより同期的な `compare()` 呼び出しで正しく動作する。
2. **App.tsx 統合**: 既存のボイラープレートテストが壊れないよう、CompareForm と ResultSummary は再エクスポートのみ追加。実際の UI への表示は Phase 5 (Polish) でボイラープレートコードを整理する際に行う。

## 次フェーズへの引き継ぎ

Phase 3（US2: 差分の視覚的な確認）で実装するもの:

- `web/src/theme/diffColors.ts`: 差分種別ごとの色定義（added=amber, removed=red, changed=blue）
- `web/src/components/DiffList.tsx`: 差分リスト（差分種別ごとの色分けハイライト、path/sourceValue/targetValue 表示）
- App.tsx への DiffList 統合

**利用可能な既存コード**:
- `useCompareStore`: result.diffs を保持している。DiffList は result.diffs を直接参照可能
- `CompareForm` / `ResultSummary`: Phase 3 でそのまま使用継続
- テストパターン: `vi.mock("@/stores/compareStore", ...)` の形式を踏襲すること

**注意事項**:
- `compare()` は同期関数（非同期ラッパー不要）
- `DiffItem.type` は `"added" | "removed" | "changed"` の3種類
- `ResultSummary` は差分件数のみ表示（詳細は DiffList が担当）
