import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useUpload } from "@/hooks/use-upload";
import { ApiError } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  uploadFile: vi.fn(),
  ApiError: class extends Error {
    code: string;
    details?: Record<string, any>;
    constructor(code: string, message: string, details?: Record<string, any>) {
      super(message);
      this.name = "ApiError";
      this.code = code;
      this.details = details;
    }
  },
  apiFetch: vi.fn(),
  getJobResults: vi.fn(),
}));

import { uploadFile } from "@/lib/api";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useUpload", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects files larger than 5MB", async () => {
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });
    const bigFile = new File(["x".repeat(6 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    });

    await act(async () => {
      try {
        await result.current.mutateAsync(bigFile);
        expect.unreachable("Should have thrown");
      } catch (e) {
        expect((e as ApiError).code).toBe("FILE_TOO_LARGE");
      }
    });

    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("rejects unsupported file types", async () => {
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });
    const textFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });

    await act(async () => {
      try {
        await result.current.mutateAsync(textFile);
        expect.unreachable("Should have thrown");
      } catch (e) {
        expect((e as ApiError).code).toBe("INVALID_FILE_TYPE");
      }
    });

    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("accepts PDF files", async () => {
    vi.mocked(uploadFile).mockResolvedValue({ job_id: "job-123" });
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });
    const pdfFile = new File(["content"], "test.pdf", {
      type: "application/pdf",
    });

    const uploadResult = await act(async () => {
      return result.current.mutateAsync(pdfFile);
    });

    expect(uploadResult).toEqual({ job_id: "job-123" });
    expect(uploadFile).toHaveBeenCalledWith(pdfFile);
  });

  it("accepts DOCX files", async () => {
    vi.mocked(uploadFile).mockResolvedValue({ job_id: "job-456" });
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });
    const docxFile = new File(["content"], "test.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    await act(async () => {
      await result.current.mutateAsync(docxFile);
    });

    expect(uploadFile).toHaveBeenCalledWith(docxFile);
  });

  it("accepts DOC files", async () => {
    vi.mocked(uploadFile).mockResolvedValue({ job_id: "job-789" });
    const { result } = renderHook(() => useUpload(), { wrapper: createWrapper() });
    const docFile = new File(["content"], "test.doc", {
      type: "application/msword",
    });

    await act(async () => {
      await result.current.mutateAsync(docFile);
    });

    expect(uploadFile).toHaveBeenCalledWith(docFile);
  });
});
