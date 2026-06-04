import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@/lib/api", () => ({
  getJobResults: vi.fn(),
  ApiError: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.name = "ApiError";
      this.code = code;
    }
  },
  apiFetch: vi.fn(),
  uploadFile: vi.fn(),
}));

import { getJobResults } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const originalUseQuery = useQuery;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

vi.mock("@/hooks/use-job-results", () => ({
  useJobResults: vi.fn(),
}));

import { useJobResults } from "@/hooks/use-job-results";

const mockedUseJobResults = vi.mocked(useJobResults);

function mockJobResultsHook(jobId: string | null) {
  const queryKey = ["job-results", jobId];
  const queryFn = () => {
    if (!jobId) throw new Error("No jobId provided");
    return getJobResults(jobId);
  };

  return originalUseQuery({
    queryKey,
    queryFn,
    retry: false,
    staleTime: 0,
    enabled: !!jobId,
    refetchInterval: false as const,
  });
}

describe("useJobResults", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockedUseJobResults.mockImplementation(mockJobResultsHook as any);
  });

  it("is disabled when jobId is null", () => {
    const { result } = renderHook(() => useJobResults(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches results when jobId is provided", async () => {
    const mockResult = {
      job_id: "job-1",
      status: "complete",
      scores: { overall: 80, clarity: 85, impact: 75, completeness: 80, relevance: 78 },
      sections: [],
      skills: [],
      grammar_issues: [],
      ats_checks: [],
    };

    vi.mocked(getJobResults).mockResolvedValue(mockResult as any);

    const { result } = renderHook(() => useJobResults("job-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.job_id).toBe("job-1");
    expect(result.current.data?.status).toBe("complete");
  });

  it("handles fetch errors", async () => {
    vi.mocked(getJobResults).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useJobResults("job-bad"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Network error");
  });
});
