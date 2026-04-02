# Phase 2 RED Tests: テキスト貼り付けによる比較実行

**Date**: 2026-04-03
**Status**: RED (FAIL verified)
**User Story**: US1 - テキスト貼り付けによる比較実行

## Summary

| Item | Value |
|------|-------|
| 作成テスト数 | 41 |
| 失敗数 | 41 (4ファイル全てインポート解決エラー) |
| テストファイル | compareStore.test.ts, useCompare.test.ts, CompareForm.test.tsx, ResultSummary.test.tsx |

## 失敗テスト一覧

| テストファイル | テスト名 | 期待する動作 |
|---------------|---------|-------------|
| stores/compareStore.test.ts | 初期状態 - source が空文字列 | store の初期値が空文字列 |
| stores/compareStore.test.ts | 初期状態 - target が空文字列 | store の初期値が空文字列 |
| stores/compareStore.test.ts | 初期状態 - result が null | store の初期値が null |
| stores/compareStore.test.ts | 初期状態 - isComparing が false | store の初期値が false |
| stores/compareStore.test.ts | 初期状態 - error が null | store の初期値が null |
| stores/compareStore.test.ts | setSource - source を更新する | setSource で source が更新される |
| stores/compareStore.test.ts | setSource - 空文字列を設定できる | 空文字列のリセットが可能 |
| stores/compareStore.test.ts | setSource - Unicode 文字を設定できる | 日本語/絵文字が保存される |
| stores/compareStore.test.ts | setSource - target に影響しない | 他フィールドへの副作用なし |
| stores/compareStore.test.ts | setTarget - target を更新する | setTarget で target が更新される |
| stores/compareStore.test.ts | setTarget - 空文字列を設定できる | 空文字列のリセットが可能 |
| stores/compareStore.test.ts | setTarget - source に影響しない | 他フィールドへの副作用なし |
| stores/compareStore.test.ts | setResult - result を設定する | ComparisonResult を保存 |
| stores/compareStore.test.ts | setResult - result を null にリセットできる | null でクリア可能 |
| stores/compareStore.test.ts | setResult - 差分ありの結果を設定できる | diffs 配列を含む結果の保存 |
| stores/compareStore.test.ts | setIsComparing - true/false の切替 | isComparing フラグの更新 |
| stores/compareStore.test.ts | setError - エラーメッセージの設定/クリア | error の設定と null リセット |
| stores/compareStore.test.ts | reset - 全状態を初期値にリセット | 全フィールドが初期値に戻る |
| hooks/useCompare.test.ts | runCompare - compare() 呼び出し | source/target を渡して compare 実行 |
| hooks/useCompare.test.ts | runCompare - 結果を store に反映 | ComparisonResult が store に保存 |
| hooks/useCompare.test.ts | runCompare - 比較中 isComparing が true | 処理中フラグが立つ |
| hooks/useCompare.test.ts | runCompare - 完了後 isComparing が false | 処理完了後にフラグが下がる |
| hooks/useCompare.test.ts | バリデーション - source が空 | エラー設定、compare 未呼出 |
| hooks/useCompare.test.ts | バリデーション - target が空 | エラー設定、compare 未呼出 |
| hooks/useCompare.test.ts | バリデーション - 両方空 | エラー設定、compare 未呼出 |
| hooks/useCompare.test.ts | バリデーション - 空白のみ | エラー設定、compare 未呼出 |
| hooks/useCompare.test.ts | エラーハンドリング - compare 例外 | エラーを store に設定 |
| hooks/useCompare.test.ts | エッジケース - 大きなテキスト | 10000文字でも compare 実行 |
| hooks/useCompare.test.ts | エッジケース - 特殊文字 | XSS文字列も正しく渡す |
| hooks/useCompare.test.ts | エッジケース - 再比較時エラークリア | 前回エラーがクリアされる |
| components/CompareForm.test.tsx | source テキストエリアの表示 | 元情報入力欄が存在 |
| components/CompareForm.test.tsx | target テキストエリアの表示 | AI出力入力欄が存在 |
| components/CompareForm.test.tsx | 比較ボタンの表示 | 比較ボタンが存在 |
| components/CompareForm.test.tsx | 比較ボタンクリックで runCompare 呼出 | クリック時に比較実行 |
| components/CompareForm.test.tsx | 比較中ボタン無効化 | isComparing 中は disabled |
| components/CompareForm.test.tsx | テキスト入力で setSource/setTarget 呼出 | 入力イベントが store に反映 |
| components/CompareForm.test.tsx | エラーメッセージ表示 | error がある場合に表示 |
| components/ResultSummary.test.tsx | 結果なし時の非表示 | result null で何も表示しない |
| components/ResultSummary.test.tsx | match: true で「一致」表示 | 一致テキストが表示される |
| components/ResultSummary.test.tsx | match: false で「不一致」表示 | 不一致テキストが表示される |
| components/ResultSummary.test.tsx | スコア表示 | 数値スコアが画面に表示される |

## 実装ヒント

- `useCompareStore`: Zustand の `create` で状態管理。`set` で各フィールドを更新するアクションを公開
- `useCompare`: カスタムフック。store から source/target を取得し、バリデーション後に `compare({ source, target })` を呼び出し、結果を store に反映
- `CompareForm`: 2つの `<textarea>` または MUI `TextField` (multiline)。`useCompareStore` から source/target/setSource/setTarget を取得。`useCompare` の `runCompare` をボタンに接続
- `ResultSummary`: `useCompareStore` から result を取得。null なら非表示。match/score/diffs.length を表示
- バリデーション: source/target が空文字列または空白のみの場合にエラー
- compare() は同期関数。async ラッパー不要

## npm test 出力 (抜粋)

```
FAIL src/components/CompareForm.test.tsx
Error: Failed to resolve import "./CompareForm" from "src/components/CompareForm.test.tsx". Does the file exist?

FAIL src/components/ResultSummary.test.tsx
Error: Failed to resolve import "@/stores/compareStore" from "src/components/ResultSummary.test.tsx". Does the file exist?

FAIL src/hooks/useCompare.test.ts
Error: Failed to resolve import "@/stores/compareStore" from "src/hooks/useCompare.test.ts". Does the file exist?

FAIL src/stores/compareStore.test.ts
Error: Failed to resolve import "./compareStore" from "src/stores/compareStore.test.ts". Does the file exist?

Test Files  4 failed | 9 passed (13)
     Tests  31 passed (31)
```
