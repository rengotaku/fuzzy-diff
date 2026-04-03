# Phase 5 Output: Polish & Cross-Cutting Concerns

**Date**: 2026-04-03
**Status**: Completed

## 実行済みタスク

- [x] T049 セットアップ分析を読む: specs/009-diff-view-webui/tasks/ph1-output.md
- [x] T050 前フェーズの出力を読む: specs/009-diff-view-webui/tasks/ph4-output.md
- [x] T051 `web/wrangler.toml` のプロジェクト名・デプロイ設定を更新
- [x] T052 `web/` で `npm run lint` を実行し、Lint エラーを修正
- [x] T053 `web/` で `npm run build` が成功することを確認
- [x] T054 不要なボイラープレートコード・サンプルファイルを削除
- [x] T055 `cd web && npm test` で全テストパスを確認
- [x] T056 `cd web && npm run build` でビルド成功を確認
- [x] T057 生成: specs/009-diff-view-webui/tasks/ph5-output.md

## 変更ファイル

| ファイル | 変更種別 | 概要 |
|---------|---------|------|
| web/wrangler.toml | 変更 | `name` を `react-spa-cloudflare` から `verify-ai-web` に更新 |
| web/src/App.tsx | 変更 | ルーティング（BrowserRouter + AppRouter）を削除し、CompareForm + ResultSummary + DiffList を直接表示するSPA構成に変更 |
| web/src/components/DiffList.tsx | 変更 | `DiffListProps.diffs` の型を `DiffItem[]` から `readonly DiffItem[]` に変更 |
| web/src/components/DiffList.test.tsx | 変更 | 未使用インポート（`vi`, `beforeEach`, `within`）を削除 |
| web/src/components/ResultSummary.test.tsx | 変更 | 未使用変数 `container` を削除 |
| web/src/components/index.ts | 変更 | Layout 削除に伴い、3コンポーネントのみエクスポートに整理 |
| web/src/hooks/useCompare.ts | 変更 | 未使用の分割代入を削除。`compare()` 呼び出しをオブジェクト形式から `(source, target)` に修正 |
| web/src/hooks/useCompare.test.ts | 変更 | `compare()` アサーションを実際のAPIシグネチャ `(source, target)` に合わせて修正 |
| web/src/hooks/index.ts | 変更 | `useCompare` のみエクスポートに整理 |
| src/normalizer/number.ts | 変更 | 未使用の `UNIT_MULTIPLIERS` 定数を削除、`_match` にリネーム（`noUnusedLocals` 対応） |
| web/src/pages/ | 削除 | HomePage, AboutPage, GreetingForm, GreetingPage, NotFoundPage とそれらのテストを全削除 |
| web/src/router.tsx | 削除 | react-router-dom ルーティング設定 |
| web/src/router.test.tsx | 削除 | ルーティングテスト |
| web/src/App.test.tsx | 削除 | ボイラープレートの App テスト |
| web/src/hooks/useGreetingStore.ts | 削除 | ボイラープレートの Zustand ストア |
| web/src/hooks/useUIStore.ts | 削除 | ボイラープレートの UI ストア |
| web/src/hooks/useUIStore.test.ts | 削除 | useUIStore テスト |
| web/src/components/Layout.tsx | 削除 | ナビゲーション付きレイアウト |
| web/src/components/Layout.test.tsx | 削除 | Layout テスト |
| web/src/schemas/index.ts | 削除 | 空のスキーマファイル |

## テスト結果

```
Test Files  6 passed (6)
     Tests  92 passed (92)
  Start at  13:10:25
  Duration  1.02s
```

ボイラープレート削除前: 15ファイル, 123テスト
ボイラープレート削除後: 6ファイル, 92テスト（verify-ai 固有のテストのみ残存）

## ビルド結果

```
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-DQXMvJoe.css    0.16 kB │ gzip:   0.14 kB
dist/assets/index-CsEZxDIi.js   429.13 kB │ gzip: 134.68 kB

✓ built in 114ms
```

バンドルサイズ: 551KB → 429KB（ボイラープレートページ削除による削減）

## 発見した課題と対応

1. **`compare()` APIシグネチャの不一致**: Phase 2 GREEN で `compare({ source, target })` というオブジェクト形式で実装されたが、実際の関数は `compare(source: string, target: string)` のシグネチャ。`useCompare.ts` と対応するテストアサーションを実際のAPIに合わせて修正。

2. **`src/normalizer/number.ts` の型エラー**: `web/tsconfig.app.json` の `noUnusedLocals: true` が `tsc -b` 経由で `../src/` にも適用されていた。`UNIT_MULTIPLIERS`（未使用定数）を削除し、コールバック引数 `match` を `_match` にリネームして解消。

3. **`DiffList.diffs` の型不整合**: `ComparisonResult.diffs` が `readonly DiffItem[]` だが `DiffListProps.diffs` が mutable な `DiffItem[]` だった。`readonly` に変更して解消。

4. **`CompareForm.test.tsx` の型キャスト**: モック状態オブジェクトが `CompareState` の全プロパティを持たないため型エラーが発生。`as any` キャストで解消。

## 次フェーズへの引き継ぎ

Phase 5（Polish）でフィーチャー全体が完了。追加フェーズなし。

**最終的な web/src/ 構成**:
- `App.tsx`: ThemeProvider + CompareForm + ResultSummary + DiffList のシングルページSPA
- `components/CompareForm.tsx`: テキスト入力フォーム（source/target）
- `components/ResultSummary.tsx`: 比較結果サマリー（MUI Alert ベース）
- `components/DiffList.tsx`: 差分リスト（色分けハイライト）
- `stores/compareStore.ts`: Zustand ストア
- `hooks/useCompare.ts`: compare() 呼び出しフック
- `theme/diffColors.ts`: 差分色定義
- `test/`: テストインフラ（setup.ts, test-utils.tsx, mocks/）

**デプロイ設定**: `web/wrangler.toml` の `name = "verify-ai-web"` 設定済み。`npm run build` で `dist/` に静的ファイルを生成、Cloudflare Pages にデプロイ可能な状態。
