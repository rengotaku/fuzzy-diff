import { describe, it, expect } from "vitest";
import { compareStructured } from "../../src/comparator/structured.js";
import type { ParsedRecord } from "../../src/types.js";

describe("compareStructured", () => {
  describe("同一レコード", () => {
    it("同一のParsedRecordは1.0を返す", () => {
      const record: ParsedRecord = {
        headers: ["名前", "年齢"],
        rows: [{ "名前": "太郎", "年齢": "20" }],
      };
      const result = compareStructured(record, record);
      expect(result.score).toBe(1.0);
      expect(result.diffs).toHaveLength(0);
    });
  });

  describe("順序違い", () => {
    it("行の順序が異なっても同一内容なら高スコア", () => {
      const source: ParsedRecord = {
        headers: ["名前", "年齢"],
        rows: [
          { "名前": "太郎", "年齢": "20" },
          { "名前": "花子", "年齢": "25" },
        ],
      };
      const target: ParsedRecord = {
        headers: ["名前", "年齢"],
        rows: [
          { "名前": "花子", "年齢": "25" },
          { "名前": "太郎", "年齢": "20" },
        ],
      };
      const result = compareStructured(source, target);
      expect(result.score).toBe(1.0);
      expect(result.diffs).toHaveLength(0);
    });
  });

  describe("ヘッダー欠落", () => {
    it("片方にヘッダーがない場合はmismatch", () => {
      const source: ParsedRecord = {
        headers: ["名前", "年齢"],
        rows: [{ "名前": "太郎", "年齢": "20" }],
      };
      const target: ParsedRecord = {
        headers: null,
        rows: [{ "0": "太郎", "1": "20" }],
      };
      const result = compareStructured(source, target);
      expect(result.score).toBeLessThan(0.65);
    });
  });

  describe("行数の違い", () => {
    it("欠落行がある場合はdiffsに含まれる", () => {
      const source: ParsedRecord = {
        headers: ["名前"],
        rows: [{ "名前": "太郎" }, { "名前": "花子" }, { "名前": "次郎" }],
      };
      const target: ParsedRecord = {
        headers: ["名前"],
        rows: [{ "名前": "太郎" }, { "名前": "花子" }],
      };
      const result = compareStructured(source, target);
      expect(result.score).toBeLessThan(1.0);
      expect(result.diffs.length).toBeGreaterThan(0);
    });
  });
});
