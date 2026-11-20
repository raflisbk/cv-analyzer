import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { localeWrapper } from "../i18n/render-with-locale";
import { useAppWorkspaceHistory } from "@/hooks/use-app-workspace-history";
import { getVersionDiff } from "@/lib/app-api/history";

vi.mock("@/lib/app-api/history", () => ({
  getVersionDiff: vi.fn(),
  restoreVersion: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

it("shows unavailable text instead of a blank comparison", async () => {
  vi.mocked(getVersionDiff).mockResolvedValue([]);
  const { result } = renderHook(() => useAppWorkspaceHistory("job"), {
    wrapper: localeWrapper,
  });
  await act(async () => {
    await result.current.compare("v1");
  });
  expect(result.current.diff).toBeNull();
  expect(result.current.loadError).toContain("unavailable");
});
