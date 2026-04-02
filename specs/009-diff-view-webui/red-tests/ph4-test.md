# Phase 4 RED Tests: 差分なしの確認

**Date**: 2026-04-03
**Status**: RED (FAIL verified)
**User Story**: US3 - 差分なしの確認

## Summary

| Item | Value |
|------|-------|
| Tests Created | 5 |
| Failed Count | 5 |
| Test Files | web/src/components/ResultSummary.test.tsx |

## 注記: DiffList (T040) について

DiffList の空リスト時「差分なし」メッセージ表示は Phase 3 で既に実装済み。
`web/src/components/DiffList.test.tsx` に `差分が空の場合「差分なし」メッセージが表示される` テストが存在し、PASS している。
重複テストの追加は不要と判断した。

## Failed Tests

| Test File | Test Method | Expected Behavior |
|-----------|-------------|-------------------|
| ResultSummary.test.tsx | match=true, score=1.0, diffs=[] の場合に成功インジケータが表示される | `data-testid="match-success"` 要素の存在 |
| ResultSummary.test.tsx | match=true の場合に成功を示すアラート/カードが表示される | `role="alert"` 要素（MUI Alert success）の存在 |
| ResultSummary.test.tsx | match=false の場合に警告/エラーを示すアラートが表示される | `role="alert"` 要素（MUI Alert warning）の存在 |
| ResultSummary.test.tsx | 完全一致時にチェックマークアイコンが表示される | CheckCircle SVG アイコンの存在 |
| ResultSummary.test.tsx | 完全一致時に「完全一致」のテキストが表示される | score=1.0 かつ diffs=[] 時に「完全一致」テキスト表示 |

## Implementation Hints

- `ResultSummary.tsx`: 現在の `<Typography>` ベースの表示を MUI `<Alert>` コンポーネントに変更
  - `match=true` の場合: `<Alert severity="success">` + `data-testid="match-success"`
  - `match=false` の場合: `<Alert severity="warning">`
- score=1.0 かつ diffs.length === 0 の場合に「完全一致」テキストを表示
- MUI の `CheckCircle` アイコンを success 時に表示
- Edge cases: match=true でも diffs が残るケース（閾値による判定）と完全一致（score=1.0, diffs=[]）を区別

## npm test Output (excerpt)

```
FAIL src/components/ResultSummary.test.tsx > ResultSummary > 一致時の成功表示（US3） > match=true, score=1.0, diffs=[] の場合に成功インジケータが表示される
FAIL src/components/ResultSummary.test.tsx > ResultSummary > 一致時の成功表示（US3） > match=true の場合に成功を示すアラート/カードが表示される
FAIL src/components/ResultSummary.test.tsx > ResultSummary > 一致時の成功表示（US3） > match=false の場合に警告/エラーを示すアラートが表示される
FAIL src/components/ResultSummary.test.tsx > ResultSummary > 一致時の成功表示（US3） > 完全一致時にチェックマークアイコンが表示される
FAIL src/components/ResultSummary.test.tsx > ResultSummary > 一致時の成功表示（US3） > 完全一致時に「完全一致」のテキストが表示される

Test Files  1 failed | 14 passed (15)
     Tests  5 failed | 118 passed (123)
```
