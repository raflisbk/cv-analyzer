import { act, renderHook, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useAppWorkspaceHistory } from "@/hooks/use-app-workspace-history";
import { HistoryRestoreDialog } from "@/components/app-workspace/panel/history-restore-dialog";
import { restoreVersion } from "@/lib/app-api/history";

const push = vi.fn();
const invalidateQueries = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/app-api/history", () => ({
  getVersionDiff: vi.fn(),
  restoreVersion: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries }),
}));

beforeEach(() => vi.clearAllMocks());

async function restoreFrom(versionId: string) {
  const hook = renderHook(() => useAppWorkspaceHistory("job"));
  act(() => hook.result.current.setRestoreId(versionId));
  await act(async () => {
    await hook.result.current.restore();
  });
  return hook;
}

it("restores through the client and opens the new version", async () => {
  vi.mocked(restoreVersion).mockResolvedValue({ jobId: "new", version: "v3" });
  await restoreFrom("v1");
  expect(restoreVersion).toHaveBeenCalledWith("job", "v1");
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: ["app-history", "job"],
  });
  expect(push).toHaveBeenCalledWith("/app/cvs/new?view=editor&tab=history");
});

it("shows an error and stays put when restore fails", async () => {
  vi.mocked(restoreVersion).mockRejectedValue(new Error("409"));
  const { result } = await restoreFrom("v1");
  expect(result.current.loadError).toContain("Could not restore");
  expect(result.current.restoring).toBe(false);
  expect(push).not.toHaveBeenCalled();
});

it("does nothing without a selected version", async () => {
  const { result } = renderHook(() => useAppWorkspaceHistory("job"));
  await act(async () => {
    await result.current.restore();
  });
  expect(restoreVersion).not.toHaveBeenCalled();
});

it("disables the dialog actions while restoring", () => {
  render(
    <HistoryRestoreDialog
      versionId="v1"
      restoring
      onCancel={vi.fn()}
      onRestore={vi.fn()}
    />,
  );
  expect(screen.getByRole("button", { name: "Restoring…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  expect(screen.getByRole("dialog").textContent).toContain(
    "keeps all other versions",
  );
});
