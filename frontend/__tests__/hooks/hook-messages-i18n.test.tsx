import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { withLocale } from "./../i18n/with-locale";
import { ApiError } from "@/lib/api";
import { useUpload } from "@/hooks/use-upload";
import { useDraftSave } from "@/hooks/use-draft-save";
import { useAuthSessions } from "@/hooks/use-auth-sessions";
import { useAppJobMatch } from "@/hooks/use-app-job-match";
import { getSessions } from "@/lib/auth";
import { matchJob } from "@/lib/app-api/jobmatch";
import type { Locale } from "@/lib/i18n/locales";

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("use-debounce", () => ({
  useDebouncedCallback: (callback: (...args: unknown[]) => void) => callback,
}));
vi.mock("@/lib/api", async (original) => ({
  ...(await original<typeof import("@/lib/api")>()),
  uploadFile: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({
  getSessions: vi.fn(),
  revokeSession: vi.fn(),
}));
vi.mock("@/lib/app-api/jobmatch", () => ({ matchJob: vi.fn() }));

afterEach(() => vi.clearAllMocks());

function wrapperFor(locale: Locale) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    withLocale(
      <QueryClientProvider client={client}>{children}</QueryClientProvider>,
      locale,
    );
}

const bigFile = () =>
  new File(["x".repeat(6 * 1024 * 1024)], "big.pdf", {
    type: "application/pdf",
  });

describe.each([
  [
    "id",
    "File itu lebih dari 5 MB. Kecilkan atau pecah CV kamu.",
    "Cek file kamu, lalu coba lagi ya.",
  ],
  [
    "en",
    "That file is over 5 MB. Compress or split your CV.",
    "Please check your file and try again.",
  ],
] as const)("hook messages in %s", (locale, tooLarge, checkFile) => {
  it("useUpload toasts a translated title and description", async () => {
    const { result } = renderHook(() => useUpload(), {
      wrapper: wrapperFor(locale),
    });
    await act(async () => {
      await result.current.mutateAsync({ file: bigFile() }).catch(() => {});
    });
    expect(toast.error).toHaveBeenCalledWith(
      tooLarge,
      expect.objectContaining({ description: checkFile }),
    );
  });

  it("useDraftSave toasts a translated failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const { result } = renderHook(() => useDraftSave("job-1"), {
      wrapper: wrapperFor(locale),
    });
    act(() => result.current.markUnsaved({}));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    const message = vi.mocked(toast.error).mock.calls[0][0] as string;
    expect(
      message.startsWith(
        locale === "id" ? "Perubahan belum" : "Failed to save",
      ),
    ).toBe(true);
    vi.unstubAllGlobals();
  });

  it("useAuthSessions reports a translated load error", async () => {
    vi.mocked(getSessions).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAuthSessions(true), {
      wrapper: wrapperFor(locale),
    });
    await waitFor(() =>
      expect(result.current.error).toBe(
        locale === "id"
          ? "Sesi kamu belum bisa dimuat."
          : "Could not load sessions.",
      ),
    );
  });

  it("useAppJobMatch reports translated validation and run errors", async () => {
    const { result } = renderHook(() => useAppJobMatch("job-1"), {
      wrapper: wrapperFor(locale),
    });
    act(() => result.current.setDescription("short"));
    await act(async () => {
      await result.current.runMatch();
    });
    expect(result.current.error).toBe(
      locale === "id"
        ? "Tempel deskripsi pekerjaan minimal 50 karakter."
        : "Paste a job description of at least 50 characters.",
    );
    vi.mocked(matchJob).mockRejectedValue(new ApiError("X", "raw"));
    act(() => result.current.setDescription("x".repeat(60)));
    await act(async () => {
      await result.current.runMatch();
    });
    expect(result.current.error).toBe(
      locale === "id"
        ? "Pencocokan pekerjaan belum bisa jalan. Coba lagi ya."
        : "Job match could not run. Try again.",
    );
  });
});
