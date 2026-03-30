import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compare } from "../../src/index.js";

interface GoldenFile {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly expected_match: boolean;
  readonly expected_similarity: string;
  readonly source: string;
  readonly ai_output: string;
}

function loadGolden(filename: string): GoldenFile {
  const path = join(import.meta.dirname, "../../poc/golden", filename);
  return JSON.parse(readFileSync(path, "utf-8"));
}

describe("ゴールデンファイル: Phase 3 (US1 - テキスト正規化による基本比較)", () => {
  describe("01: 完全一致", () => {
    const golden = loadGolden("01_exact_match.json");

    it("matchと判定される", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.match).toBe(golden.expected_match);
    });

    it("スコアが1.0に近い", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.score).toBeGreaterThanOrEqual(0.95);
    });

    it("差分が空", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.diffs).toHaveLength(0);
    });
  });

  describe("02: 空白・改行の違い", () => {
    const golden = loadGolden("02_whitespace_diff.json");

    it("matchと判定される", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.match).toBe(golden.expected_match);
    });

    it("高い類似度スコア", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("03: 全角半角の違い", () => {
    const golden = loadGolden("03_fullwidth_halfwidth.json");

    it("matchと判定される", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.match).toBe(golden.expected_match);
    });

    it("高い類似度スコア", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("04: カタカナ・ひらがなの違い", () => {
    const golden = loadGolden("04_katakana_hiragana.json");

    it("matchと判定される", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.match).toBe(golden.expected_match);
    });

    it("高い類似度スコア", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("16: 数値・日付の表記揺れ", () => {
    const golden = loadGolden("16_number_format.json");

    it("matchと判定される", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.match).toBe(golden.expected_match);
    });

    it("高い類似度スコア", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("17: 複合: 軽度の差異", () => {
    const golden = loadGolden("17_combined_mild.json");

    it("matchと判定される", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.match).toBe(golden.expected_match);
    });

    it("高い類似度スコア", () => {
      const result = compare(golden.source, golden.ai_output);
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    });
  });
});
