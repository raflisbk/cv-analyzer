import { beforeEach, expect, it, vi } from "vitest";
import { getJobPdf } from "@/lib/app-api/workspace";

vi.mock("@/lib/auth-refresh", () => ({
  currentRefreshVersion: () => 0,
  refreshSession: () => Promise.resolve(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn());
});

it("loads the original PDF through the same-origin proxy", async () => {
  const file = new Blob(["pdf"], { type: "application/pdf" });
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    blob: async () => file,
  } as Response);
  expect(await getJobPdf("cv/1")).toBe(file);
  const [url, options] = vi.mocked(fetch).mock.calls[0];
  expect(url).toBe("/api/v1/jobs/cv%2F1/file/proxy");
  expect(String(url).startsWith("/api/v1/jobs/")).toBe(true);
  expect(options).toMatchObject({ credentials: "include" });
});

it.each([401, 404])(
  "reports an unavailable original on HTTP %s",
  async (status) => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status } as Response);
    await expect(getJobPdf("cv-1")).rejects.toThrow(
      "Original file unavailable",
    );
  },
);
