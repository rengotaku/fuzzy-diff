# Phase 1 Output: Setup

**Date**: 2026-04-13
**Status**: Completed

## Executed Tasks

- [x] T001 既存コンポーネントを確認: DiffList.tsx, ResultSummary.tsx, App.tsx
- [x] T002 既存ストアを確認: compareStore.ts
- [x] T003 既存テーマ・テストを確認: diffColors.ts, DiffList.test.tsx
- [x] T004 コアロジックの DiffItem 出力を確認: structured.ts, index.ts
- [x] T005 セットアップ分析を出力

## Existing Code Analysis

### web/src/App.tsx

**Structure**:
- `App`: ルートコンポーネント。`ThemeProvider` + `CssBaseline` + `Container` 内に `CompareForm`, `ResultSummary`, `DiffList` を配置
- `result` を `useCompareStore` から取得し、存在時のみ `DiffList` を表示

**Required Updates**:
1. `DiffList` 直接表示 → `DiffViewSwitcher` + ビューモード切替ロジックに置換
2. `source`, `target` もストアから取得して side-by-side/inline ビューに渡す

### web/src/components/DiffList.tsx

**Structure**:
- `DiffList({ diffs })`: DiffItem[] をカード形式でリスト表示
- 各カードに `data-diff-type` 属性、`diffColors` で色分け
- `DIFF_LABELS`: added→追加, removed→欠落, changed→変更

**Required Updates**: なし（既存のリストビューとしてそのまま残す）

### web/src/components/ResultSummary.tsx

**Structure**:
- `ResultSummary`: 比較結果のサマリー表示（一致/不一致、スコア、差分件数）
- `useCompareStore` から result, isComparing を取得

**Required Updates**: なし

### web/src/stores/compareStore.ts

**Structure**:
- `CompareState`: source, target, result, isComparing, error + setter + reset
- `initialState`: 全フィールド空/null/false

**Required Updates**:
1. `viewMode: DiffViewMode` フィールド追加（デフォルト: "side-by-side"）
2. `setViewMode` アクション追加

### web/src/theme/diffColors.ts

**Structure**:
- `diffColors`: added(orange), removed(red), changed(blue) の background/text 色定義

**Required Updates**: なし（HighlightedText からそのまま流用可能）

### web/src/hooks/useCompare.ts

**Structure**:
- `useCompare`: `runCompare()` を返す。バリデーション → compare() → setResult

**Required Updates**: なし

### web/src/components/index.ts

**Structure**:
- CompareForm, ResultSummary, DiffList を re-export

**Required Updates**: 新コンポーネント（DiffViewSwitcher, HighlightedText, SideBySideView, InlineView）の追加

### src/comparator/structured.ts（コアロジック）

**Structure**:
- `compareStructured`: ヘッダー欠落チェック → カラム完全性 → 行マッチング
- ヘッダー片方欠落時 → score: 0.4 + headers diff
- 行マッチング: greedy matching + fuzzy 比較（token_set_ratio）
- `diffRecords`: キー単位で added/removed/changed の DiffItem を生成

**DiffItem 出力パターン**:
- `path`: キー名（例: "価格"）またはプレフィックス（"column:価格", "rows", "headers"）
- `sourceValue`/`targetValue`: 値の文字列表現
- テキスト比較時: `path` は空文字、値は行テキスト

### src/comparator/index.ts（比較パイプライン）

**Structure**:
- `compare()`: フォーマット検出 → 正規化 → 構造化比較 or テキスト比較 → スコアリング
- ヘッダーミスマッチ時は構造化比較を優先
- それ以外は構造化 vs テキストの高い方を採用
- `buildDiffs()`: 行レベルの added/removed DiffItem を生成（path は空文字）

## Existing Test Analysis

- `web/src/components/DiffList.test.tsx`: DiffList の描画テスト（26ケース）。基本レンダリング、色分け、ラベル、値表示、エッジケース（null, 空文字, Unicode, HTML特殊文字, 100件）
- `web/src/stores/compareStore.test.ts`: compareStore のテスト（source/target/result/isComparing/error/reset）
- `web/src/components/CompareForm.test.tsx`: フォーム入力テスト
- `web/src/components/ResultSummary.test.tsx`: サマリー表示テスト
- `web/src/hooks/useCompare.test.ts`: useCompare フックテスト
- `web/src/test/test-utils.tsx`: render ヘルパー（BrowserRouter ラッパー）

**テスト方針**: `@testing-library/react` + `vitest` + `jsdom`。`@/test/test-utils` の `render` を使用。

**Does not exist (新規作成)**:
- `web/src/utils/highlightMapper.test.ts`
- `web/src/components/HighlightedText.test.tsx`
- `web/src/components/SideBySideView.test.tsx`
- `web/src/components/InlineView.test.tsx`
- `web/src/components/DiffViewSwitcher.test.tsx`

## Technical Decisions

1. **highlightMapper は web/src/utils/ に配置**: ビュー層のユーティリティとして実装。コアロジック（src/）には手を加えない（Principle 5: レイヤー分離）
2. **DiffItem.sourceValue/targetValue の indexOf で位置特定**: 正規表現より安全で、特殊文字エスケープ不要。同一値の重複は前回マッチ位置以降を検索して対応
3. **utils/ ディレクトリは新規作成**: 既存 web/src/ に utils/ はない。mkdir が必要
4. **MUI ToggleButtonGroup でビュー切替**: 既存 MUI v7 依存内、1クリック切替を実現
5. **diffColors はそのまま流用**: background/text の色定義をハイライト span の背景色に適用

## Handoff to Next Phase

Phase 2（基盤）で実装するもの:
- `web/src/utils/highlightMapper.ts`: findHighlightSpans() + splitToSegments() + 型定義
- `web/src/components/HighlightedText.tsx`: TextSegment[] → ハイライト付き span 描画
- `web/src/stores/compareStore.ts`: viewMode + setViewMode 追加

再利用可能な既存コード:
- `diffColors` の色定義（HighlightedText で直接 import）
- `@/test/test-utils` の render（新テストで使用）
- `DiffItem` 型（verify-ai パッケージから import）

注意点:
- `web/src/utils/` ディレクトリは新規作成が必要
- compareStore.test.ts は既存テストに viewMode 関連を追加する形で拡張
- HighlightedText は MUI Box/Typography ではなく素の span でシンプルに実装（パフォーマンス重視）
