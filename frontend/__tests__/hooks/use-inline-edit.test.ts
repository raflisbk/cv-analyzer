import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInlineEdit } from "@/hooks/use-inline-edit";

describe("useInlineEdit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial state with no selection visible", () => {
    const { result } = renderHook(() => useInlineEdit("job-1"));
    expect(result.current.state.isVisible).toBe(false);
    expect(result.current.state.selectedText).toBe("");
    expect(result.current.state.selectionRect).toBeNull();
  });

  it("closePopover hides the popover", () => {
    const { result } = renderHook(() => useInlineEdit("job-1"));

    act(() => {
      result.current.closePopover();
    });

    expect(result.current.state.isVisible).toBe(false);
    expect(result.current.state.selectedText).toBe("");
  });

  it("handleSelectionChange does nothing when there is no selection", () => {
    const { result } = renderHook(() => useInlineEdit("job-1"));

    window.getSelection = vi.fn().mockReturnValue({
      isCollapsed: true,
    }) as unknown as typeof window.getSelection;

    act(() => {
      result.current.handleSelectionChange();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.state.isVisible).toBe(false);
  });

  it("handleSelectionChange shows popover for valid text selection", () => {
    const mockRange = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 200,
        right: 300,
        bottom: 220,
        width: 200,
        height: 20,
        x: 100,
        y: 200,
      }),
    };

    window.getSelection = vi.fn().mockReturnValue({
      isCollapsed: false,
      toString: () => "  Selected text here  ",
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    }) as unknown as typeof window.getSelection;

    const { result } = renderHook(() => useInlineEdit("job-1"));

    act(() => {
      result.current.handleSelectionChange();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.state.isVisible).toBe(true);
    expect(result.current.state.selectedText).toBe("Selected text here");
  });

  it("handleSelectionChange ignores selections shorter than 2 chars", () => {
    const mockRange = {
      getBoundingClientRect: () => ({
        left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
      }),
    };

    window.getSelection = vi.fn().mockReturnValue({
      isCollapsed: false,
      toString: () => "  a  ",
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    }) as unknown as typeof window.getSelection;

    const { result } = renderHook(() => useInlineEdit("job-1"));

    act(() => {
      result.current.handleSelectionChange();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.state.isVisible).toBe(false);
  });

  it("calculates rectPercent relative to PDF page element", () => {
    const mockPageEl = document.createElement("div");
    mockPageEl.className = "react-pdf__Page";
    mockPageEl.getBoundingClientRect = () =>
      DOMRect.fromRect({ x: 0, y: 0, width: 600, height: 800 });
    document.body.appendChild(mockPageEl);

    const mockRange = {
      getBoundingClientRect: () =>
        DOMRect.fromRect({ x: 100, y: 200, width: 200, height: 20 }),
    };

    window.getSelection = vi.fn().mockReturnValue({
      isCollapsed: false,
      toString: () => "  Some selected text  ",
      getRangeAt: () => mockRange,
      removeAllRanges: vi.fn(),
    }) as unknown as typeof window.getSelection;

    const { result } = renderHook(() => useInlineEdit("job-1"));

    act(() => {
      result.current.handleSelectionChange();
      vi.advanceTimersByTime(200);
    });

    expect(result.current.state.isVisible).toBe(true);
    expect(result.current.state.rectPercent).toEqual({
      left: expect.any(Number),
      top: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number),
    });

    document.body.removeChild(mockPageEl);
  });
});
