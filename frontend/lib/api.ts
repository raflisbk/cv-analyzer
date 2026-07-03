import { refreshTokens } from "@/lib/auth";
import { WrappedResponse } from "./types";
import type { AnalysisResult } from "./types";

const API_URL = "/api/v1";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  _isRetry = false
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const isFormData = options?.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: isFormData
        ? undefined
        : {
            "Content-Type": "application/json",
            ...options?.headers,
          },
    });
  } catch (error) {
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error"
    );
  }

  // On 401: attempt a silent token refresh and replay the original request once.
  // Both paths (first attempt + retry) must clear auth state and throw UNAUTHORIZED
  // so the UI can redirect to login — do NOT fall through to JSON parsing on 401.
  if (response.status === 401) {
    if (!_isRetry) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return apiFetch<T>(endpoint, options, true);
      }
    }
    const { useAuthStore } = await import("@/stores/auth-store");
    useAuthStore.getState().setUser(null);
    throw new ApiError("UNAUTHORIZED", "Session expired. Please log in again.");
  }

  let data: WrappedResponse<T>;
  try {
    data = await response.json() as WrappedResponse<T>;
  } catch {
    throw new ApiError("PARSE_ERROR", "Unexpected response format from server.");
  }

  if (data.error) {
    throw new ApiError(data.error.code, data.error.message, data.error.details);
  }

  if (!("data" in data)) {
    throw new ApiError("NO_DATA", "API response missing data field");
  }

  return data.data as T;
}

export interface UploadOptions {
  targetRole?: string;
  parentJobId?: string;
  jdText?: string;
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.targetRole) { formData.append("target_role", options.targetRole); }
  if (options.parentJobId) { formData.append("parent_job_id", options.parentJobId); }
  if (options.jdText) { formData.append("jd_text", options.jdText); }

  return apiFetch<{ job_id: string }>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getJobResults(jobId: string): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`/jobs/${jobId}/results`);
}
