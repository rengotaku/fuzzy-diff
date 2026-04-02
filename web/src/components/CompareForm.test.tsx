import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { CompareForm } from "./CompareForm";

// useCompare hook をモック
vi.mock("@/hooks/useCompare", () => ({
  useCompare: vi.fn(() => ({
    runCompare: vi.fn(),
  })),
}));

// compareStore をモック
vi.mock("@/stores/compareStore", () => ({
  useCompareStore: vi.fn((selector) => {
    const state = {
      source: "",
      target: "",
      isComparing: false,
      error: null,
      setSource: vi.fn(),
      setTarget: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

import { useCompare } from "@/hooks/useCompare";
import { useCompareStore } from "@/stores/compareStore";
const mockUseCompare = vi.mocked(useCompare);
const mockUseCompareStore = vi.mocked(useCompareStore);

describe("CompareForm", () => {
  const mockRunCompare = vi.fn();
  const mockSetSource = vi.fn();
  const mockSetTarget = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRunCompare.mockClear();
    mockSetSource.mockClear();
    mockSetTarget.mockClear();

    mockUseCompare.mockReturnValue({ runCompare: mockRunCompare });
    mockUseCompareStore.mockImplementation((selector) => {
      const state = {
        source: "",
        target: "",
        isComparing: false,
        error: null,
        setSource: mockSetSource,
        setTarget: mockSetTarget,
      };
      return selector ? (selector as (s: typeof state) => unknown)(state) : state;
    });
  });

  // --- テキストエリア表示 ---

  describe("テキストエリアの表示", () => {
    it("元情報 (source) のテキストエリアが表示される", () => {
      render(<CompareForm />);
      const textarea = screen.getByLabelText(/元情報|source/i);
      expect(textarea).toBeInTheDocument();
    });

    it("AI出力 (target) のテキストエリアが表示される", () => {
      render(<CompareForm />);
      const textarea = screen.getByLabelText(/AI出力|target/i);
      expect(textarea).toBeInTheDocument();
    });

    it("テキストエリアが2つ存在する", () => {
      render(<CompareForm />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas.length).toBeGreaterThanOrEqual(2);
    });
  });

  // --- 比較ボタン ---

  describe("比較ボタン", () => {
    it("比較ボタンが表示される", () => {
      render(<CompareForm />);
      const button = screen.getByRole("button", { name: /比較/i });
      expect(button).toBeInTheDocument();
    });

    it("比較ボタンをクリックすると runCompare が呼ばれる", async () => {
      const user = userEvent.setup();

      // 入力ありの状態にする
      mockUseCompareStore.mockImplementation((selector) => {
        const state = {
          source: "hello",
          target: "world",
          isComparing: false,
          error: null,
          setSource: mockSetSource,
          setTarget: mockSetTarget,
        };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<CompareForm />);
      const button = screen.getByRole("button", { name: /比較/i });
      await user.click(button);

      expect(mockRunCompare).toHaveBeenCalledTimes(1);
    });

    it("比較中はボタンが無効化される", () => {
      mockUseCompareStore.mockImplementation((selector) => {
        const state = {
          source: "a",
          target: "b",
          isComparing: true,
          error: null,
          setSource: mockSetSource,
          setTarget: mockSetTarget,
        };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<CompareForm />);
      const button = screen.getByRole("button", { name: /比較/i });
      expect(button).toBeDisabled();
    });
  });

  // --- テキスト入力 ---

  describe("テキスト入力", () => {
    it("source テキストエリアに入力すると setSource が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<CompareForm />);

      const sourceTextarea = screen.getByLabelText(/元情報|source/i);
      await user.type(sourceTextarea, "test input");

      expect(mockSetSource).toHaveBeenCalled();
    });

    it("target テキストエリアに入力すると setTarget が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<CompareForm />);

      const targetTextarea = screen.getByLabelText(/AI出力|target/i);
      await user.type(targetTextarea, "test input");

      expect(mockSetTarget).toHaveBeenCalled();
    });
  });

  // --- バリデーション ---

  describe("バリデーション", () => {
    it("エラーがある場合エラーメッセージが表示される", () => {
      mockUseCompareStore.mockImplementation((selector) => {
        const state = {
          source: "",
          target: "",
          isComparing: false,
          error: "両方のテキストを入力してください",
          setSource: mockSetSource,
          setTarget: mockSetTarget,
        };
        return selector ? (selector as (s: typeof state) => unknown)(state) : state;
      });

      render(<CompareForm />);
      expect(screen.getByText(/両方のテキストを入力してください/i)).toBeInTheDocument();
    });

    it("エラーがない場合エラーメッセージが表示されない", () => {
      render(<CompareForm />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // --- エッジケース ---

  describe("エッジケース", () => {
    it("特殊文字を含むテキストが入力できる", async () => {
      const user = userEvent.setup();
      render(<CompareForm />);

      const sourceTextarea = screen.getByLabelText(/元情報|source/i);
      await user.type(sourceTextarea, "<script>");

      expect(mockSetSource).toHaveBeenCalled();
    });
  });
});
