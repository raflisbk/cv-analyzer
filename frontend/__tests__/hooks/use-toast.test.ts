import { describe, it, expect, vi } from "vitest";
import { reducer } from "@/hooks/use-toast";

describe("use-toast reducer", () => {
  const initialState = { toasts: [] as any[] };

  it("adds a toast", () => {
    const state = reducer(initialState, {
      type: "ADD_TOAST",
      toast: { id: "1", open: true } as any,
    });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe("1");
  });

  it("limits toasts to TOAST_LIMIT (1)", () => {
    const state1 = reducer(initialState, {
      type: "ADD_TOAST",
      toast: { id: "1", open: true } as any,
    });
    const state2 = reducer(state1, {
      type: "ADD_TOAST",
      toast: { id: "2", open: true } as any,
    });

    expect(state2.toasts).toHaveLength(1);
    expect(state2.toasts[0].id).toBe("2");
  });

  it("updates a toast", () => {
    const state1 = reducer(initialState, {
      type: "ADD_TOAST",
      toast: { id: "1", title: "Original", open: true } as any,
    });
    const state2 = reducer(state1, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "Updated" } as any,
    });

    expect(state2.toasts[0].title).toBe("Updated");
  });

  it("dismisses a specific toast by ID", () => {
    const state1 = reducer(initialState, {
      type: "ADD_TOAST",
      toast: { id: "1", open: true } as any,
    });
    const state2 = reducer(state1, {
      type: "DISMISS_TOAST",
      toastId: "1",
    });

    expect(state2.toasts[0].open).toBe(false);
  });

  it("dismisses all toasts when no ID provided", () => {
    const stateWithToasts = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ] as any[],
    };

    vi.useFakeTimers();
    const state = reducer(stateWithToasts, {
      type: "DISMISS_TOAST",
    });

    expect(state.toasts[0].open).toBe(false);
    expect(state.toasts[1].open).toBe(false);
    vi.useRealTimers();
  });

  it("removes a specific toast", () => {
    const stateWithToasts = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ] as any[],
    };

    const state = reducer(stateWithToasts, {
      type: "REMOVE_TOAST",
      toastId: "1",
    });

    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe("2");
  });

  it("removes all toasts when no ID provided", () => {
    const stateWithToasts = {
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true },
      ] as any[],
    };

    const state = reducer(stateWithToasts, {
      type: "REMOVE_TOAST",
    });

    expect(state.toasts).toHaveLength(0);
  });
});
