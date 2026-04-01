import { describe, it, expect } from "vitest";
import { detectFormat } from "../../src/parser/detector.js";

describe("detectFormat", () => {
  describe("JSON検出", () => {
    it("JSON配列を検出する", () => {
      const result = detectFormat('[{"key": "value"}]');
      expect(result.type).toBe("json");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("JSON二次元配列をarray型として検出する", () => {
      const result = detectFormat('[["a", "b"], ["c", "d"]]');
      expect(result.type).toBe("array");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe("TSV検出", () => {
    it("タブ区切りデータを検出する", () => {
      const result = detectFormat("名前\t年齢\n太郎\t20");
      expect(result.type).toBe("tsv");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("CSV検出", () => {
    it("カンマ区切りデータを検出する", () => {
      const result = detectFormat("名前,年齢\n太郎,20");
      expect(result.type).toBe("csv");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("YAML検出", () => {
    it("YAMLリスト形式を検出する", () => {
      const result = detectFormat("- 名前: 太郎\n  年齢: 20");
      expect(result.type).toBe("yaml");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("INI検出", () => {
    it("INIセクション形式を検出する", () => {
      const result = detectFormat("[section]\nkey=value");
      expect(result.type).toBe("ini");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe("プレーンテキスト", () => {
    it("構造化されていないテキストはplainを返す", () => {
      const result = detectFormat("これは普通のテキストです。");
      expect(result.type).toBe("plain");
    });
  });
});
