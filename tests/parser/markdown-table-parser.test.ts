import { describe, it, expect } from "vitest";
import { parseMarkdownTable } from "../../src/parser/markdown-table-parser.js";

describe("parseMarkdownTable", () => {
  describe("基本パイプテーブル", () => {
    it("ヘッダー + 区切り行 + データ行をパースする", () => {
      const text = [
        "| 商品名 | 価格 | 在庫 |",
        "| --- | --- | --- |",
        "| りんご | 150円 | 20個 |",
        "| みかん | 100円 | 35個 |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["商品名", "価格", "在庫"]);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ "商品名": "りんご", "価格": "150円", "在庫": "20個" });
      expect(result.rows[1]).toEqual({ "商品名": "みかん", "価格": "100円", "在庫": "35個" });
    });

    it("アラインメント付き区切り行をパースする", () => {
      const text = [
        "| Name | Score | Grade |",
        "| :--- | :---: | ---: |",
        "| Alice | 95 | A |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["Name", "Score", "Grade"]);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ "Name": "Alice", "Score": "95", "Grade": "A" });
    });

    it("最小区切り（ハイフン1つ）をパースする", () => {
      const text = [
        "| A | B |",
        "| - | - |",
        "| 1 | 2 |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["A", "B"]);
      expect(result.rows[0]).toEqual({ "A": "1", "B": "2" });
    });
  });

  describe("先頭/末尾パイプの省略", () => {
    it("先頭/末尾パイプなしをパースする", () => {
      const text = [
        "Name | Age",
        "--- | ---",
        "Bob | 30",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["Name", "Age"]);
      expect(result.rows[0]).toEqual({ "Name": "Bob", "Age": "30" });
    });

    it("先頭パイプのみをパースする", () => {
      const text = [
        "| Name | Age",
        "| --- | ---",
        "| Bob | 30",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["Name", "Age"]);
      expect(result.rows[0]).toEqual({ "Name": "Bob", "Age": "30" });
    });
  });

  describe("エッジケース", () => {
    it("空セルを正しくパースする", () => {
      const text = [
        "| A | B | C |",
        "| - | - | - |",
        "|   |   | x |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.rows[0]).toEqual({ "A": "", "B": "", "C": "x" });
    });

    it("カラム数不足の行を空セルで補完する", () => {
      const text = [
        "| A | B | C |",
        "| - | - | - |",
        "| 1 | 2 |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.rows[0]).toEqual({ "A": "1", "B": "2", "C": "" });
    });

    it("余分なカラムは切り捨てる", () => {
      const text = [
        "| A | B |",
        "| - | - |",
        "| 1 | 2 | 3 | 4 |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.rows[0]).toEqual({ "A": "1", "B": "2" });
    });

    it("ヘッダーのみ（データ行なし）をパースする", () => {
      const text = [
        "| A | B |",
        "| - | - |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["A", "B"]);
      expect(result.rows).toHaveLength(0);
    });

    it("Markdownテーブルでないテキストは空結果を返す", () => {
      const result = parseMarkdownTable("これは普通のテキストです");
      expect(result.headers).toBeNull();
      expect(result.rows).toHaveLength(0);
    });

    it("区切り行がない場合は空結果を返す", () => {
      const text = [
        "| A | B |",
        "| 1 | 2 |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toBeNull();
      expect(result.rows).toHaveLength(0);
    });

    it("セル内の余分な空白をトリムする", () => {
      const text = [
        "|  Name  |  Value  |",
        "| --- | --- |",
        "|  Alice  |  100  |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.headers).toEqual(["Name", "Value"]);
      expect(result.rows[0]).toEqual({ "Name": "Alice", "Value": "100" });
    });

    it("エスケープされたパイプを処理する", () => {
      const text = [
        "| Expression | Result |",
        "| --- | --- |",
        "| a \\| b | true |",
      ].join("\n");

      const result = parseMarkdownTable(text);
      expect(result.rows[0]).toEqual({ "Expression": "a | b", "Result": "true" });
    });
  });
});
