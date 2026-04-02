# Phase 1 Output: Setup

**Date**: 2026-04-02
**Status**: Completed

## 実行済みタスク

- [x] T001 `rengotaku/my-boilerplate/react-spa-cloudflare` を `web/` にコピー
- [x] T002 `web/package.json` を編集: プロジェクト名を `verify-ai-web` に変更
- [x] T003 `web/vite.config.ts` に `resolve.alias` を追加: `'verify-ai'` → `'../src'`
- [x] T004 `web/tsconfig.app.json` に `paths` を追加: `'verify-ai'` → `['../src/index.ts']`
- [x] T005 `web/` で `npm install` を実行し依存関係をインストール（diff, fuzzball も追加）
- [x] T006 `web/` で `npm run build` が成功することを確認
- [x] T007 ph1-output.md の生成

## 既存コード分析

### verify-ai ロジック層（`src/`）

**公開API**（`src/index.ts`）:
- `compare(input: ComparisonInput, options?: CompareOptions)`: メイン比較関数 → `ComparisonResult`
- `compareText`, `compareStructured`, `calculateScore`, `isMatch`: サブ関数
- `normalize`: テキスト正規化
- `detectFormat`, `parse`: フォーマット検出・パース

**型定義**（`src/types.ts`）:
- `ComparisonInput`: `{ source: string; target: string }`
- `ComparisonResult`: `{ score: number; match: boolean; diffs: DiffItem[]; sourceFormat; targetFormat }`
- `DiffItem`: `{ type: "added"|"removed"|"changed"; path: string; sourceValue: string|null; targetValue: string|null }`
- `CompareOptions`: `{ threshold?: number; normalize?: boolean; orderSensitive?: boolean }`

### ボイラープレート構成（`web/src/`）

**テストインフラ**:
- `test/setup.ts`: MSW サーバーのセットアップ（beforeAll/afterEach/afterAll）
- `test/test-utils.tsx`: `render` ラッパー（BrowserRouter 付き）、Testing Library の re-export
- `test/mocks/server.ts`: MSW サーバー
- `test/mocks/handlers.ts`: MSW ハンドラー

**既存コンポーネント（置き換え対象）**:
- `pages/`: HomePage, AboutPage, GreetingPage, GreetingForm, NotFoundPage
- `components/Layout.tsx`: ナビゲーション付きレイアウト
- `hooks/useGreetingStore.ts`, `hooks/useUIStore.ts`: Zustand ストア
- `router.tsx`: react-router-dom ルーティング
- `theme/index.ts`: MUI テーマ設定
- `schemas/index.ts`: Zod スキーマ

**ビルド設定**:
- `vitest.config.ts`: jsdom 環境、globals: true、`@` と `verify-ai` エイリアス
- `vite.config.ts`: React プラグイン、`@` と `verify-ai` エイリアス
- `tsconfig.app.json`: `paths` に `@/*` と `verify-ai` マッピング

## 既存テスト分析

- `App.test.tsx`: アプリのレンダリングテスト（9テスト）
- `router.test.tsx`: ルーティングテスト
- `pages/*.test.tsx`: 各ページのレンダリングテスト
- `hooks/useUIStore.test.ts`: Zustand ストアテスト
- `components/Layout.test.tsx`: レイアウトテスト
- 合計: 9ファイル、31テスト、全パス

**テストユーティリティ**:
- `render()`: BrowserRouter でラップ済みの render 関数（`test/test-utils.tsx`）
- MSW: API モック（本機能ではサーバーサイド不要のため不使用）
- Vitest globals: `describe`, `it`, `expect` がグローバル利用可能

## 技術的決定

1. **verify-ai の依存ライブラリ（diff, fuzzball）を web/package.json に追加**: Vite がバンドル時に `../src` の import を解決する際、node_modules は `web/node_modules` から参照されるため
2. **vitest.config.ts にも verify-ai エイリアスを追加**: テスト実行時にも `import { compare } from 'verify-ai'` が解決されるようにするため
3. **ボイラープレートの既存コンテンツはそのまま残す**: Phase 2 以降で必要に応じて置き換え。Phase 5 (Polish) で不要ファイルを削除

## 次フェーズへの引き継ぎ

Phase 2（US1: テキスト貼り付けによる比較実行）で実装するもの:
- `stores/compareStore.ts`: Zustand ストア（既存の `useGreetingStore.ts` を参考にパターンを踏襲）
- `hooks/useCompare.ts`: compare() 呼び出しフック（既存の `hooks/` パターンを踏襲）
- `components/CompareForm.tsx`: テキスト入力フォーム（既存の `GreetingForm.tsx` を参考）
- `components/ResultSummary.tsx`: 結果サマリー表示

**再利用可能な既存コード**:
- `test/test-utils.tsx`: render ラッパー（そのまま使用可能）
- `test/setup.ts`: テストセットアップ（そのまま使用可能）
- `theme/index.ts`: MUI テーマ（拡張して差分色を追加）
- Zustand パターン: `useGreetingStore.ts` のパターンを踏襲

**注意事項**:
- `verify-ai` の `compare()` は同期関数。非同期ラッパーは不要
- ボイラープレートの既存ページ・ルーティングは Phase 5 で整理
- テストでは `test-utils.tsx` の `render` を使用すること
