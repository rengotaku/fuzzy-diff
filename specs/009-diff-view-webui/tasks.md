# Tasks: diff結果のビュー表示（Web UI）

**Input**: 設計ドキュメント `/specs/009-diff-view-webui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: TDD は User Story フェーズで必須。Test Implementation (RED) → Implementation (GREEN) → Verification のワークフローに従う。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 依存なし（異なるファイル、実行順序自由）
- **[Story]**: 対応するユーザーストーリー（例: US1, US2, US3）
- 正確なファイルパスを記述に含める

## User Story Summary

| ID  | Title                    | Priority | FR          | Scenario                               |
|-----|--------------------------|----------|-------------|----------------------------------------|
| US1 | テキスト貼り付けによる比較実行 | P1       | FR-1,2,3,4,5,6,9 | テキスト入力→比較実行→サマリー表示       |
| US2 | 差分の視覚的な確認         | P1       | FR-7,8      | 差分リストの色分けハイライト表示          |
| US3 | 差分なしの確認             | P2       | FR-5,6      | 一致時の結果表示                         |

## Path Conventions

- **ロジック層**: `src/`（既存、変更なし）
- **Web UI**: `web/src/`（新規）
- **テスト**: `web/src/**/*.test.{ts,tsx}`

---

## Phase 1: Setup（プロジェクト初期化） — NO TDD

<!-- EXECUTION STRATEGY
type: setup
executor: direct
model: sonnet
parallel_groups:
  - [T002, T003, T004]
notes: T001 を先に実行後、T002-T004 を並列。T005-T007 は直列。
-->

**Purpose**: ボイラープレートの配置、verify-ai参照設定、開発環境の構築

- [x] T001 `rengotaku/my-boilerplate/react-spa-cloudflare` を `web/` にコピー
- [x] T002 [P] `web/package.json` を編集: プロジェクト名を `verify-ai-web` に変更
- [x] T003 [P] `web/vite.config.ts` に `resolve.alias` を追加: `'verify-ai'` → `'../src'`
- [x] T004 [P] `web/tsconfig.app.json` に `paths` を追加: `'verify-ai'` → `['../src/index.ts']`、`references` に `../tsconfig.json` を追加
- [x] T005 `web/` で `npm install` を実行し依存関係をインストール
- [x] T006 `web/` で `npm run build` が成功することを確認
- [x] T007 生成: specs/009-diff-view-webui/tasks/ph1-output.md

---

## Phase 2: User Story 1 - テキスト貼り付けによる比較実行 (Priority: P1) MVP

<!-- EXECUTION STRATEGY
type: tdd
executor: subagent
red_model: opus
green_model: sonnet
parallel_groups:
  - [T009, T010, T011, T012]
  - [T016, T017, T018, T019]
-->

**Goal**: 2つのテキストエリアにテキストを貼り付け、比較ボタンを押すと match/score/diffs のサマリーが表示される

**Independent Test**: テキストを貼り付けて比較ボタンを押し、結果が表示されることを確認

### Input

- [ ] T008 前フェーズの出力を読む: specs/009-diff-view-webui/tasks/ph1-output.md

### Test Implementation (RED)

- [x] T009 [P] [US1] Zustand store のテストを実装: `web/src/stores/compareStore.test.ts`（初期状態、入力更新、比較結果セット、エラーセット）
- [x] T010 [P] [US1] useCompare hook のテストを実装: `web/src/hooks/useCompare.test.ts`（compare()呼び出し、結果の状態反映、バリデーションエラー）
- [x] T011 [P] [US1] CompareForm コンポーネントのテストを実装: `web/src/components/CompareForm.test.tsx`（テキストエリア2つの表示、比較ボタン、バリデーション）
- [x] T012 [P] [US1] ResultSummary コンポーネントのテストを実装: `web/src/components/ResultSummary.test.tsx`（match/score表示、結果なし時の非表示）
- [x] T013 `cd web && npm test` で FAIL (RED) を確認
- [x] T014 RED出力を生成: specs/009-diff-view-webui/red-tests/ph2-test.md

### Implementation (GREEN)

- [x] T015 RED テストを読む: specs/009-diff-view-webui/red-tests/ph2-test.md
- [x] T016 [P] [US1] Zustand store を実装: `web/src/stores/compareStore.ts`（CompareState: source, target, result, isComparing, error）
- [x] T017 [P] [US1] useCompare hook を実装: `web/src/hooks/useCompare.ts`（verify-aiのcompare()呼び出し、バリデーション、状態更新）
- [x] T018 [P] [US1] CompareForm コンポーネントを実装: `web/src/components/CompareForm.tsx`（source/target テキストエリア、比較ボタン、react-hook-form + Zod バリデーション）
- [x] T019 [P] [US1] ResultSummary コンポーネントを実装: `web/src/components/ResultSummary.tsx`（match/score/diffsカウント表示）
- [x] T020 [US1] App.tsx にCompareForm + ResultSummary を統合: `web/src/App.tsx`
- [x] T021 `cd web && npm test` で PASS (GREEN) を確認

### Verification

- [x] T022 `cd web && npm test` で全テストパスを確認（リグレッションなし）
- [x] T023 生成: specs/009-diff-view-webui/tasks/ph2-output.md

**Checkpoint**: テキスト入力→比較実行→サマリー表示のフローが動作する

---

## Phase 3: User Story 2 - 差分の視覚的な確認 (Priority: P1)

<!-- EXECUTION STRATEGY
type: tdd
executor: subagent
red_model: opus
green_model: sonnet
parallel_groups:
  - [T026, T027]
  - [T031, T032]
-->

**Goal**: 差分リストで追加・欠落・変更がそれぞれ異なる色でハイライト表示される

**Independent Test**: 差分のあるテキストを比較し、追加/欠落/変更が色分けされていることを確認

### Input

- [ ] T024 セットアップ分析を読む: specs/009-diff-view-webui/tasks/ph1-output.md
- [ ] T025 前フェーズの出力を読む: specs/009-diff-view-webui/tasks/ph2-output.md

### Test Implementation (RED)

- [x] T026 [P] [US2] 差分色定義のテストを実装: `web/src/theme/diffColors.test.ts`（added/removed/changed の色マッピング）
- [x] T027 [P] [US2] DiffList コンポーネントのテストを実装: `web/src/components/DiffList.test.tsx`（差分種別ごとのハイライト色、sourceValue/targetValue の両方表示、空リスト時の表示）
- [x] T028 `cd web && npm test` で FAIL (RED) を確認
- [x] T029 RED出力を生成: specs/009-diff-view-webui/red-tests/ph3-test.md

### Implementation (GREEN)

- [x] T030 RED テストを読む: specs/009-diff-view-webui/red-tests/ph3-test.md
- [x] T031 [P] [US2] 差分色定義を実装: `web/src/theme/diffColors.ts`（added=amber, removed=red, changed=blue）
- [x] T032 [P] [US2] DiffList コンポーネントを実装: `web/src/components/DiffList.tsx`（差分種別ごとの色分け、path/sourceValue/targetValue 表示）
- [x] T033 [US2] App.tsx に DiffList を統合: `web/src/App.tsx`
- [x] T034 `cd web && npm test` で PASS (GREEN) を確認

### Verification

- [x] T035 `cd web && npm test` で全テストパスを確認（US1含むリグレッションなし）
- [x] T036 生成: specs/009-diff-view-webui/tasks/ph3-output.md

**Checkpoint**: 差分リストが色分けハイライト付きで表示される

---

## Phase 4: User Story 3 - 差分なしの確認 (Priority: P2)

<!-- EXECUTION STRATEGY
type: tdd
executor: subagent
red_model: opus
green_model: sonnet
parallel_groups:
  - [T039, T040]
  - [T044, T045]
-->

**Goal**: 完全に一致するテキストを比較した場合、一致を示す明確な結果が表示される

**Independent Test**: 同一テキストを両方に入力し、一致の結果表示を確認

### Input

- [ ] T037 セットアップ分析を読む: specs/009-diff-view-webui/tasks/ph1-output.md
- [ ] T038 前フェーズの出力を読む: specs/009-diff-view-webui/tasks/ph3-output.md

### Test Implementation (RED)

- [x] T039 [US3] ResultSummary の一致表示テストを追加: `web/src/components/ResultSummary.test.tsx`（match=true, score=1.0, diffs=[] 時の表示確認）
- [x] T040 [US3] DiffList の空リスト表示テストを追加: `web/src/components/DiffList.test.tsx`（diffs=[] 時に「差分なし」メッセージ表示）※Phase 3で実装済み、テスト既存PASS
- [x] T041 `cd web && npm test` で FAIL (RED) を確認
- [x] T042 RED出力を生成: specs/009-diff-view-webui/red-tests/ph4-test.md

### Implementation (GREEN)

- [x] T043 RED テストを読む: specs/009-diff-view-webui/red-tests/ph4-test.md
- [x] T044 [US3] ResultSummary に一致時の表示を追加: `web/src/components/ResultSummary.tsx`（一致アイコン/メッセージ）
- [x] T045 [US3] DiffList に空リスト時のメッセージを追加: `web/src/components/DiffList.tsx`（「差分なし」表示）※Phase 3で実装済み、追加不要
- [x] T046 `cd web && npm test` で PASS (GREEN) を確認

### Verification

- [x] T047 `cd web && npm test` で全テストパスを確認（US1, US2含むリグレッションなし）
- [x] T048 生成: specs/009-diff-view-webui/tasks/ph4-output.md

**Checkpoint**: 一致/不一致の両パターンで適切な結果が表示される

---

## Phase 5: Polish & Cross-Cutting Concerns — NO TDD

<!-- EXECUTION STRATEGY
type: polish
executor: direct
model: haiku
parallel_groups:
  - [T051, T052, T053]
-->

**Purpose**: デプロイ設定、型エラー修正、APIエクスポート整理

### Input

- [ ] T049 セットアップ分析を読む: specs/009-diff-view-webui/tasks/ph1-output.md
- [ ] T050 前フェーズの出力を読む: specs/009-diff-view-webui/tasks/ph4-output.md

### Implementation

- [ ] T051 [P] `web/wrangler.toml` のプロジェクト名・デプロイ設定を更新
- [ ] T052 [P] `web/` で `npm run lint` を実行し、Lint エラーを修正
- [ ] T053 [P] `web/` で `npm run build` が成功することを確認
- [ ] T054 不要なボイラープレートコード・サンプルファイルを削除

### Verification

- [ ] T055 `cd web && npm test` で全テストパスを確認
- [ ] T056 `cd web && npm run build` でビルド成功を確認
- [ ] T057 生成: specs/009-diff-view-webui/tasks/ph5-output.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — メインエージェント直接実行
- **US1 (Phase 2)**: Phase 1 に依存 — TDD フロー（speckit:tdd-generator → speckit:phase-executor）
- **US2 (Phase 3)**: Phase 2 に依存（ResultSummary, store が必要）— TDD フロー
- **US3 (Phase 4)**: Phase 3 に依存（DiffList の空リスト対応）— TDD フロー
- **Polish (Phase 5)**: Phase 4 に依存 — speckit:phase-executor のみ

### Within Each User Story Phase (TDD Flow)

1. **Input**: セットアップ分析 (ph1) + 前フェーズの出力を読む
2. **Test Implementation (RED)**: テストを先に書く → `npm test` FAIL を確認 → RED 出力生成
3. **Implementation (GREEN)**: RED テストを読む → 実装 → `npm test` PASS を確認
4. **Verification**: リグレッションなしを確認 → フェーズ出力生成

### Agent Delegation

- **Phase 1 (Setup)**: メインエージェント直接実行
- **Phase 2-4 (User Stories)**: speckit:tdd-generator (RED) → speckit:phase-executor (GREEN + Verification)
- **Phase 5 (Polish)**: speckit:phase-executor のみ

### [P] Marker (依存なし)

`[P]` は「他のタスクへの依存なし、実行順序自由」を示す。並列実行を保証するものではない。

---

## Phase Output & RED Test Artifacts

### Directory Structure

```
specs/009-diff-view-webui/
├── tasks.md
├── tasks/
│   ├── ph1-output.md
│   ├── ph2-output.md
│   ├── ph3-output.md
│   ├── ph4-output.md
│   └── ph5-output.md
└── red-tests/
    ├── ph2-test.md
    ├── ph3-test.md
    └── ph4-test.md
```

### Phase Output Format

| Output Type      | Template File                                |
|------------------|----------------------------------------------|
| `ph1-output.md`  | `.specify/templates/ph1-output-template.md`  |
| `phN-output.md`  | `.specify/templates/phN-output-template.md`  |
| `phN-test.md`    | `.specify/templates/red-test-template.md`    |

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2)

1. Phase 1 完了: Setup（ボイラープレート配置、verify-ai参照設定）
2. Phase 2 完了: US1（テキスト入力→比較→サマリー表示）
3. **STOP and VALIDATE**: `cd web && npm test` で全テストパスを確認
4. ブラウザで手動検証: テキスト貼り付け→比較→結果表示

### Full Delivery

1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
2. 各フェーズでコミット: `feat(phase-N): description`

---

## Test Coverage Rules

**Boundary Test Principle**: データ変換が発生するすべての境界でテストを書く

```
[テキスト入力] → [バリデーション] → [compare()呼出] → [状態更新] → [UI表示]
      ↓               ↓                ↓               ↓            ↓
    Test            Test             Test            Test         Test
```

**Checklist**:
- [ ] 入力バリデーションテスト（空文字、片方のみ）
- [ ] compare() 呼び出しテスト（正常系、エラー系）
- [ ] 状態管理テスト（store の状態遷移）
- [ ] UI表示テスト（コンポーネントレンダリング、色分け）

---

## Notes

- [P] タスク = 依存なし、実行順序自由
- [Story] ラベルはトレーサビリティのため特定のユーザーストーリーにマッピング
- 各ユーザーストーリーは独立して完了・テスト可能
- TDD: Test Implementation (RED) → Verify FAIL → Implementation (GREEN) → Verify PASS
- RED 出力は実装開始前に生成必須
- 各フェーズ完了後にコミット
- チェックポイントでストーリーを独立検証可能
