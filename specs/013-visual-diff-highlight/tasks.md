# Tasks: 差分の視覚的表示 — 元テキスト保持＋差分ハイライト

**Input**: Design documents from `/specs/013-visual-diff-highlight/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: TDD は User Story フェーズで必須。各フェーズは Test Implementation (RED) → Implementation (GREEN) → Verification のワークフローに従う。

**Organization**: タスクはユーザーストーリーごとにグループ化し、独立した実装・テストを可能にする。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 依存なし（異なるファイル、実行順序自由）
- **[Story]**: タスクが属するユーザーストーリー（US1, US2 等）
- 説明には正確なファイルパスを含む

## User Story Summary

| ID  | Title                          | Priority | FR        | Scenario                  |
|-----|--------------------------------|----------|-----------|---------------------------|
| US1 | Side-by-side で差分箇所を確認  | P1       | FR-1,2,5,6,7 | Side-by-side ハイライト表示 |
| US2 | インラインビューで差分を確認   | P2       | FR-3      | 上下並列ハイライト表示     |
| US3 | ビュー切替を行う               | P2       | FR-4,8    | 3ビュー切替UI             |

> US3（ビュー切替）は US1 と密結合のため Phase 3 で US1 と同時に実装する。

## Path Conventions

- **Web app**: `web/src/` 配下
- **テストコマンド**: `cd web && npm test`

---

## Phase 1: Setup（既存コード確認） — NO TDD

<!-- EXECUTION STRATEGY
type: setup
executor: direct
model: sonnet
parallel_groups:
  - [T001]
  - [T002, T003, T004]
  - [T005]
-->

**Purpose**: 既存実装の確認と変更準備

- [x] T001 既存コンポーネントを確認: `web/src/components/DiffList.tsx`, `web/src/components/ResultSummary.tsx`, `web/src/App.tsx`
- [x] T002 [P] 既存ストアを確認: `web/src/stores/compareStore.ts`
- [x] T003 [P] 既存テーマ・テストを確認: `web/src/theme/diffColors.ts`, `web/src/components/DiffList.test.tsx`
- [x] T004 [P] コアロジックの DiffItem 出力を確認: `src/comparator/structured.ts`, `src/comparator/index.ts`
- [x] T005 セットアップ分析を出力: `specs/013-visual-diff-highlight/tasks/ph1-output.md`

---

## Phase 2: 基盤 — highlightMapper + HighlightedText + Store拡張 (TDD)

<!-- EXECUTION STRATEGY
type: tdd
executor: subagent
red_model: opus
green_model: sonnet
parallel_groups:
  - [T007, T008, T009]
  - [T013, T014, T015]
-->

**Goal**: 全ビューが共有する基盤ユーティリティとコンポーネントを実装する

**Independent Test**: `highlightMapper` に DiffItem[] と元テキストを渡して HighlightSpan[] が正しく返ることをユニットテストで確認する

### Input

- [x] T006 前フェーズ出力を読む: `specs/013-visual-diff-highlight/tasks/ph1-output.md`

### Test Implementation (RED)

- [x] T007 [P] highlightMapper のテストを実装: `web/src/utils/highlightMapper.test.ts`
  - DiffItem の sourceValue/targetValue から元テキスト内の位置を特定できること
  - 同じ値が複数回出現する場合に順序を保持すること
  - path が空文字の場合に行単位で検索すること
  - 値が見つからない場合に空配列を返すこと
- [x] T008 [P] HighlightedText のテストを実装: `web/src/components/HighlightedText.test.tsx`
  - TextSegment[] をハイライト付き span で描画すること
  - ハイライトなしセグメントが通常テキストで描画されること
  - 差分タイプに応じた色が適用されること
- [x] T009 [P] compareStore 拡張のテストを実装: `web/src/stores/compareStore.test.ts`
  - viewMode のデフォルトが "side-by-side" であること
  - setViewMode で切替可能であること
- [x] T010 `cd web && npm test` で FAIL を確認 (RED)
- [x] T011 RED 出力を生成: `specs/013-visual-diff-highlight/red-tests/ph2-test.md`

### Implementation (GREEN)

- [ ] T012 RED テストを読む: `specs/013-visual-diff-highlight/red-tests/ph2-test.md`
- [ ] T013 [P] 型定義を作成: `web/src/utils/highlightMapper.ts`（HighlightSpan, TextSegment, DiffViewMode 型）
- [ ] T014 [P] highlightMapper を実装: `web/src/utils/highlightMapper.ts`
  - `findHighlightSpans(text: string, diffs: DiffItem[], side: "source" | "target"): HighlightSpan[]`
  - `splitToSegments(text: string, spans: HighlightSpan[]): TextSegment[]`
- [ ] T015 [P] HighlightedText コンポーネントを実装: `web/src/components/HighlightedText.tsx`
- [ ] T016 compareStore に viewMode を追加: `web/src/stores/compareStore.ts`
- [ ] T017 `cd web && npm test` で PASS を確認 (GREEN)

### Verification

- [ ] T018 `cd web && npm test` で全テスト通過を確認（既存テストの回帰なし）
- [ ] T019 フェーズ出力を生成: `specs/013-visual-diff-highlight/tasks/ph2-output.md`

**Checkpoint**: highlightMapper と HighlightedText が独立して動作すること

---

## Phase 3: US1 + US3 — Side-by-side ビュー + ビュー切替 (TDD) MVP

<!-- EXECUTION STRATEGY
type: tdd
executor: subagent
red_model: opus
green_model: sonnet
parallel_groups:
  - [T022, T023]
  - [T027, T028]
-->

**Goal**: Side-by-side ビューとビュー切替UIを実装し、元テキスト上で差分がハイライトされる状態を実現する

**Independent Test**: 2つのテキストを比較後、side-by-side ビューで差分箇所がハイライトされ、リスト/インライン/side-by-side を切替できること

### Input

- [ ] T020 セットアップ分析を読む: `specs/013-visual-diff-highlight/tasks/ph1-output.md`
- [ ] T021 前フェーズ出力を読む: `specs/013-visual-diff-highlight/tasks/ph2-output.md`

### Test Implementation (RED)

- [ ] T022 [P] [US1] SideBySideView のテストを実装: `web/src/components/SideBySideView.test.tsx`
  - source と target が左右に表示されること
  - 差分箇所がハイライトされること
  - ハイライトが値部分のみであること（フォーマット構文を含まない）
  - 差分がない場合にハイライトなしで表示されること
  - 片方が空の場合に「テキストなし」が表示されること
- [ ] T023 [P] [US3] DiffViewSwitcher のテストを実装: `web/src/components/DiffViewSwitcher.test.tsx`
  - 3つのビューモード（list / side-by-side / inline）が表示されること
  - クリックで viewMode が切り替わること
  - デフォルトで side-by-side が選択されていること
- [ ] T024 `cd web && npm test` で FAIL を確認 (RED)
- [ ] T025 RED 出力を生成: `specs/013-visual-diff-highlight/red-tests/ph3-test.md`

### Implementation (GREEN)

- [ ] T026 RED テストを読む: `specs/013-visual-diff-highlight/red-tests/ph3-test.md`
- [ ] T027 [P] [US1] SideBySideView コンポーネントを実装: `web/src/components/SideBySideView.tsx`
- [ ] T028 [P] [US3] DiffViewSwitcher コンポーネントを実装: `web/src/components/DiffViewSwitcher.tsx`
- [ ] T029 [US1] [US3] App.tsx を統合: DiffViewSwitcher + ビューモードに応じた表示切替: `web/src/App.tsx`
- [ ] T030 コンポーネントの re-export を更新: `web/src/components/index.ts`
- [ ] T031 `cd web && npm test` で PASS を確認 (GREEN)

### Verification

- [ ] T032 `cd web && npm test` で全テスト通過を確認（既存テストの回帰なし）
- [ ] T033 フェーズ出力を生成: `specs/013-visual-diff-highlight/tasks/ph3-output.md`

**Checkpoint**: Side-by-side ビューが動作し、リスト/side-by-side 切替が可能。MVP として単独デモ可能。

---

## Phase 4: US2 — インラインビュー (TDD)

<!-- EXECUTION STRATEGY
type: tdd
executor: subagent
red_model: opus
green_model: sonnet
parallel_groups:
  - [T036]
-->

**Goal**: インライン（上下並列）ビューを追加し、3ビューすべてが機能する状態にする

**Independent Test**: インラインビューに切り替えて、source と target が上下に表示され差分がハイライトされること

### Input

- [ ] T034 セットアップ分析を読む: `specs/013-visual-diff-highlight/tasks/ph1-output.md`
- [ ] T035 前フェーズ出力を読む: `specs/013-visual-diff-highlight/tasks/ph3-output.md`

### Test Implementation (RED)

- [ ] T036 [P] [US2] InlineView のテストを実装: `web/src/components/InlineView.test.tsx`
  - source と target が上下に表示されること
  - 差分箇所がハイライトされること
  - side-by-side と同じ差分箇所がハイライトされること
  - 差分がない場合にハイライトなしで表示されること
- [ ] T037 `cd web && npm test` で FAIL を確認 (RED)
- [ ] T038 RED 出力を生成: `specs/013-visual-diff-highlight/red-tests/ph4-test.md`

### Implementation (GREEN)

- [ ] T039 RED テストを読む: `specs/013-visual-diff-highlight/red-tests/ph4-test.md`
- [ ] T040 [US2] InlineView コンポーネントを実装: `web/src/components/InlineView.tsx`
- [ ] T041 [US2] App.tsx のビュー切替に inline ケースを追加: `web/src/App.tsx`
- [ ] T042 `cd web && npm test` で PASS を確認 (GREEN)

### Verification

- [ ] T043 `cd web && npm test` で全テスト通過を確認（既存テストの回帰なし）
- [ ] T044 フェーズ出力を生成: `specs/013-visual-diff-highlight/tasks/ph4-output.md`

**Checkpoint**: 3ビュー（リスト・side-by-side・インライン）すべてが動作すること

---

## Phase 5: Polish & Cross-Cutting Concerns — NO TDD

<!-- EXECUTION STRATEGY
type: polish
executor: direct
model: haiku
parallel_groups:
  - [T047, T048]
-->

**Purpose**: 品質改善・エッジケース対応・手動検証

### Input

- [ ] T045 セットアップ分析を読む: `specs/013-visual-diff-highlight/tasks/ph1-output.md`
- [ ] T046 前フェーズ出力を読む: `specs/013-visual-diff-highlight/tasks/ph4-output.md`

### Implementation

- [ ] T047 [P] quickstart.md の動作確認手順を実施: `specs/013-visual-diff-highlight/quickstart.md`
- [ ] T048 [P] 不要な import やデッドコードを整理
- [ ] T049 `cd web && npm run build` でビルド確認（TypeScript 型チェック + Vite ビルド）

### Verification

- [ ] T050 `cd web && npm test` で全テスト通過を確認
- [ ] T051 フェーズ出力を生成: `specs/013-visual-diff-highlight/tasks/ph5-output.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — メインエージェント直接実行
- **基盤 (Phase 2)**: Phase 1 に依存 — speckit:tdd-generator → speckit:phase-executor
- **US1+US3 (Phase 3)**: Phase 2 に依存 — speckit:tdd-generator → speckit:phase-executor
- **US2 (Phase 4)**: Phase 3 に依存 — speckit:tdd-generator → speckit:phase-executor
- **Polish (Phase 5)**: Phase 4 に依存 — speckit:phase-executor のみ

### Within Each User Story Phase (TDD Flow)

1. **Input**: セットアップ分析 (ph1) + 前フェーズ出力を読む
2. **Test Implementation (RED)**: テストを先に書く → `npm test` で FAIL 確認 → RED 出力生成
3. **Implementation (GREEN)**: RED テストを読む → 実装 → `npm test` で PASS 確認
4. **Verification**: 回帰なし確認 → フェーズ出力生成

### Agent Delegation

- **Phase 1 (Setup)**: メインエージェント直接実行
- **Phase 2〜4 (基盤/User Stories)**: speckit:tdd-generator (RED) → speckit:phase-executor (GREEN + Verification)
- **Phase 5 (Polish)**: speckit:phase-executor のみ

### [P] Marker (依存なし)

`[P]` は「他のタスクに依存せず実行順序が自由」を示す。並列実行を保証するものではない。

---

## Phase Output & RED Test Artifacts

### Directory Structure

```
specs/013-visual-diff-highlight/
├── tasks.md                    # This file
├── tasks/
│   ├── ph1-output.md           # Phase 1 出力（セットアップ結果）
│   ├── ph2-output.md           # Phase 2 出力（基盤 GREEN 結果）
│   ├── ph3-output.md           # Phase 3 出力（US1+US3 GREEN 結果）
│   ├── ph4-output.md           # Phase 4 出力（US2 GREEN 結果）
│   └── ph5-output.md           # Phase 5 出力（最終）
└── red-tests/
    ├── ph2-test.md             # Phase 2 RED テスト結果
    ├── ph3-test.md             # Phase 3 RED テスト結果
    └── ph4-test.md             # Phase 4 RED テスト結果
```

### Phase Output Format

| Output Type     | Template File                              |
|-----------------|--------------------------------------------|
| `ph1-output.md` | `.specify/templates/ph1-output-template.md` |
| `phN-output.md` | `.specify/templates/phN-output-template.md` |
| `phN-test.md`   | `.specify/templates/red-test-template.md`   |

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2 + Phase 3)

1. Phase 1 完了: セットアップ（既存コード確認）
2. Phase 2 完了: 基盤（highlightMapper + HighlightedText + Store）
3. Phase 3 完了: US1+US3（Side-by-side ビュー + ビュー切替）
4. **STOP and VALIDATE**: `cd web && npm test` で全テスト通過を確認
5. 手動で quickstart.md のサンプルデータで動作確認

### Full Delivery

1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
2. 各フェーズでコミット: `feat(phN): description`

---

## Test Coverage Rules

**Boundary Test Principle**: データ変換が発生する各境界でテストを書く

```
DiffItem[] → highlightMapper → HighlightSpan[] → splitToSegments → TextSegment[] → HighlightedText → DOM
    ↓              ↓                  ↓                   ↓                ↓              ↓
  入力検証      位置特定テスト     セグメント分割テスト  描画テスト     統合テスト    E2Eテスト
```

**チェックリスト**:
- [ ] highlightMapper 入力パースのテスト
- [ ] 位置特定ロジックのテスト（重複値、空 path、見つからない場合）
- [ ] セグメント分割のテスト
- [ ] HighlightedText 描画のテスト
- [ ] SideBySideView / InlineView 統合テスト

---

## Notes

- [P] タスク = 依存なし、実行順序自由
- [Story] ラベルは特定のユーザーストーリーへのトレーサビリティを示す
- US3（ビュー切替）は US1 と密結合のため Phase 3 で同時実装
- TDD: Test Implementation (RED) → FAIL 確認 → Implementation (GREEN) → PASS 確認
- RED 出力は実装開始前に必ず生成する
- 各フェーズ完了後にコミットする
- チェックポイントで各ストーリーを独立して検証可能
