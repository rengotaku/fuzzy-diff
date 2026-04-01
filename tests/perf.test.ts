import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { compare } from "../src/index.js";

const goldenDir = join(import.meta.dirname, "../poc/golden");

describe("パフォーマンス: 各ゴールデンファイルの比較が1秒以内", () => {
  const files = readdirSync(goldenDir).filter(
    (f) => f.endsWith(".json") && !f.startsWith("matrix"),
  );

  for (const file of files) {
    it(`${file} < 1000ms`, () => {
      const golden = JSON.parse(readFileSync(join(goldenDir, file), "utf-8"));
      const start = performance.now();
      compare(golden.source, golden.ai_output);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(1000);
    });
  }
});
