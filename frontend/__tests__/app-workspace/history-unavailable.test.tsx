import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useAppWorkspaceHistory } from "@/hooks/use-app-workspace-history";
import { getVersionDiff } from "@/lib/app-api/history";

vi.mock("@/lib/app-api/history", () => ({ getVersionDiff: vi.fn() }));

it("shows unavailable text instead of a blank comparison", async () => {
  vi.mocked(getVersionDiff).mockResolvedValue([]);
  const { result } = renderHook(() => useAppWorkspaceHistory("job"));
  await act(async () => {
    await result.current.compare("v1");
  });
  expect(result.current.diff).toBeNull();
  expect(result.current.loadError).toContain("unavailable");
});

it("explains why a version cannot be restored", async () => {
  const { result } = renderHook(() => useAppWorkspaceHistory("job"));
  act(() => result.current.restore());
  await waitFor(() =>
    expect(result.current.loadError).toContain("unavailable"),
  );
});
