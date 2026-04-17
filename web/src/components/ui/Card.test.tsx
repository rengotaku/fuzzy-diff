import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { Card, CardHeader, CardContent } from "./Card";

describe("Card", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("children を正しくレンダリングする", () => {
      render(
        <Card>
          <p>テスト内容</p>
        </Card>
      );
      expect(screen.getByText("テスト内容")).toBeInTheDocument();
    });

    it("data-testid='card' を持つ", () => {
      render(<Card>内容</Card>);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("角丸クラス rounded-lg を持つ", () => {
      render(<Card>内容</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("rounded-lg");
    });

    it("ボーダークラス border を持つ", () => {
      render(<Card>内容</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("border");
      expect(card.className).toContain("border-gray-200");
    });

    it("shadow-sm クラスを持つ", () => {
      render(<Card>内容</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("shadow-sm");
    });

    it("bg-white クラスを持つ", () => {
      render(<Card>内容</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("bg-white");
    });
  });

  // --- カスタム className ---

  describe("カスタム className", () => {
    it("追加の className が付与される", () => {
      render(<Card className="mt-8">内容</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("mt-8");
      // デフォルトクラスも維持される
      expect(card.className).toContain("rounded-lg");
    });

    it("className が空文字の場合でもデフォルトクラスが適用される", () => {
      render(<Card className="">内容</Card>);
      const card = screen.getByTestId("card");
      expect(card.className).toContain("rounded-lg");
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("複数の children をレンダリングする", () => {
      render(
        <Card>
          <p>子要素1</p>
          <p>子要素2</p>
        </Card>
      );
      expect(screen.getByText("子要素1")).toBeInTheDocument();
      expect(screen.getByText("子要素2")).toBeInTheDocument();
    });

    it("ネストされた Card をレンダリングできる", () => {
      render(
        <Card>
          <Card>ネスト</Card>
        </Card>
      );
      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(2);
    });
  });
});

describe("CardHeader", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("children を正しくレンダリングする", () => {
      render(
        <CardHeader>
          <span>ヘッダー内容</span>
        </CardHeader>
      );
      expect(screen.getByText("ヘッダー内容")).toBeInTheDocument();
    });

    it("data-testid='card-header' を持つ", () => {
      render(<CardHeader>ヘッダー</CardHeader>);
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
    });

    it("flex クラスを持つ（横並びレイアウト）", () => {
      render(<CardHeader>ヘッダー</CardHeader>);
      const header = screen.getByTestId("card-header");
      expect(header.className).toContain("flex");
      expect(header.className).toContain("items-center");
      expect(header.className).toContain("justify-between");
    });

    it("border-b クラスを持つ（下線区切り）", () => {
      render(<CardHeader>ヘッダー</CardHeader>);
      const header = screen.getByTestId("card-header");
      expect(header.className).toContain("border-b");
    });

    it("パディングクラスを持つ", () => {
      render(<CardHeader>ヘッダー</CardHeader>);
      const header = screen.getByTestId("card-header");
      expect(header.className).toContain("px-4");
      expect(header.className).toContain("py-3");
    });
  });

  // --- カスタム className ---

  describe("カスタム className", () => {
    it("追加の className が付与される", () => {
      render(<CardHeader className="bg-gray-50">ヘッダー</CardHeader>);
      const header = screen.getByTestId("card-header");
      expect(header.className).toContain("bg-gray-50");
      expect(header.className).toContain("flex");
    });
  });
});

describe("CardContent", () => {
  // --- 基本レンダリング ---

  describe("基本レンダリング", () => {
    it("children を正しくレンダリングする", () => {
      render(
        <CardContent>
          <div>コンテンツ内容</div>
        </CardContent>
      );
      expect(screen.getByText("コンテンツ内容")).toBeInTheDocument();
    });

    it("data-testid='card-content' を持つ", () => {
      render(<CardContent>コンテンツ</CardContent>);
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
    });

    it("パディングクラス p-4 を持つ", () => {
      render(<CardContent>コンテンツ</CardContent>);
      const content = screen.getByTestId("card-content");
      expect(content.className).toContain("p-4");
    });
  });

  // --- カスタム className ---

  describe("カスタム className", () => {
    it("追加の className が付与される", () => {
      render(<CardContent className="overflow-auto">コンテンツ</CardContent>);
      const content = screen.getByTestId("card-content");
      expect(content.className).toContain("overflow-auto");
      expect(content.className).toContain("p-4");
    });
  });
});

describe("Card + CardHeader + CardContent 組み合わせ", () => {
  it("Card 内に CardHeader と CardContent を配置できる", () => {
    render(
      <Card>
        <CardHeader>ヘッダー部分</CardHeader>
        <CardContent>コンテンツ部分</CardContent>
      </Card>
    );
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-header")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
    expect(screen.getByText("ヘッダー部分")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ部分")).toBeInTheDocument();
  });

  it("CardHeader が CardContent より前にレンダリングされる", () => {
    render(
      <Card>
        <CardHeader>先</CardHeader>
        <CardContent>後</CardContent>
      </Card>
    );
    const card = screen.getByTestId("card");
    const header = screen.getByTestId("card-header");
    const content = screen.getByTestId("card-content");
    // header が content より前にある
    expect(card.firstElementChild).toBe(header);
    expect(card.lastElementChild).toBe(content);
  });
});
