import { describe, it, expect } from "vitest";
import { parseJson } from "../../src/parser/json-parser.js";
import { parseCsv } from "../../src/parser/csv-parser.js";
import { parseYaml } from "../../src/parser/yaml-parser.js";
import { parseIni } from "../../src/parser/ini-parser.js";

describe("parseJson", () => {
  it("JSONオブジェクト配列をパースする", () => {
    const input = '[{"商品名":"りんご","価格":"150円"},{"商品名":"みかん","価格":"100円"}]';
    const result = parseJson(input);
    expect(result.headers).toEqual(["商品名", "価格"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ "商品名": "りんご", "価格": "150円" });
  });

  it("JSON二次元配列をヘッダーなしでパースする", () => {
    const input = '[["りんご","150円"],["みかん","100円"]]';
    const result = parseJson(input);
    expect(result.headers).toBeNull();
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ "0": "りんご", "1": "150円" });
  });
});

describe("parseCsv", () => {
  it("CSV形式をパースする（ヘッダー付き）", () => {
    const input = "商品名,価格,在庫\nりんご,150円,20個\nみかん,100円,35個";
    const result = parseCsv(input, ",");
    expect(result.headers).toEqual(["商品名", "価格", "在庫"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ "商品名": "りんご", "価格": "150円", "在庫": "20個" });
  });

  it("TSV形式をパースする（タブ区切り）", () => {
    const input = "商品名\t価格\nりんご\t150円";
    const result = parseCsv(input, "\t");
    expect(result.headers).toEqual(["商品名", "価格"]);
    expect(result.rows).toHaveLength(1);
  });
});

describe("parseYaml", () => {
  it("YAMLリスト形式をパースする", () => {
    const input = "- 商品名: りんご\n  価格: 150円\n  在庫: 20個\n- 商品名: みかん\n  価格: 100円\n  在庫: 35個";
    const result = parseYaml(input);
    expect(result.headers).toEqual(["商品名", "価格", "在庫"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ "商品名": "りんご", "価格": "150円", "在庫": "20個" });
  });
});

describe("parseIni", () => {
  it("INIセクション形式をパースする", () => {
    const input = "[りんご]\n価格=150円\n在庫=20個\n\n[みかん]\n価格=100円\n在庫=35個";
    const result = parseIni(input);
    expect(result.headers).toContain("商品名");
    expect(result.headers).toContain("価格");
    expect(result.headers).toContain("在庫");
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]["価格"]).toBe("150円");
  });
});
