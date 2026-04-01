import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compare } from "../../src/index.js";

const formatsDir = join(import.meta.dirname, "../../poc/golden/formats");

function loadFormat(name: string): string {
  return readFileSync(join(formatsDir, `${name}.txt`), "utf-8");
}

interface MatrixEntry {
  readonly expected_match: boolean;
  readonly expected_similarity: string;
  readonly note: string;
}

interface MatrixFile {
  readonly formats: readonly string[];
  readonly matrix: Record<string, MatrixEntry>;
}

const matrix: MatrixFile = JSON.parse(
  readFileSync(join(formatsDir, "matrix.json"), "utf-8"),
);

const formatData: Record<string, string> = {};
for (const fmt of matrix.formats) {
  formatData[fmt] = loadFormat(fmt);
}

describe("フォーマット総当たり比較 (36ペア)", () => {
  for (const source of matrix.formats) {
    for (const target of matrix.formats) {
      const key = `${source}->${target}`;
      const entry = matrix.matrix[key];

      describe(key, () => {
        it(`expected_match: ${entry.expected_match}`, () => {
          const result = compare(formatData[source], formatData[target]);
          expect(result.match).toBe(entry.expected_match);
        });
      });
    }
  }
});
