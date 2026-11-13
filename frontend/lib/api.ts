import { WrappedResponse } from "./types";
import type { AnalysisResult } from "./types";
import { currentRefreshVersion, refreshSession } from "./auth-refresh";

const API_URL = "/api/v1";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function fetchWithCookies(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const isFormData = options?.body instanceof FormData;
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: isFormData
      ? undefined
      : { "Content-Type": "application/json", ...options?.headers },
  });
}

async function requestApi(
  endpoint: string,
  options?: RequestInit,
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const versionAtStart = currentRefreshVersion();
  const request = () => fetchWithCookies(url, options);
  let response: Response;
  try {
    response = await request();
    if (response.status === 401 && !endpoint.startsWith("/auth/")) {
      if (currentRefreshVersion() === versionAtStart) {
        await refreshSession();
      }
      response = await request();
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Session refresh failed.") {
      throw new ApiError(
        "UNAUTHORIZED",
        "Session expired. Please log in again.",
      );
    }
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error",
    );
  }

  return response;
}

async function parseApiResponse<T>(
  response: Response,
  endpoint: string,
): Promise<T> {
  if (response.status === 401) {
    if (!endpoint.startsWith("/auth/")) {
      const { useAuthStore } = await import("@/stores/auth-store");
      useAuthStore.getState().setUser(null);
    }
    throw new ApiError("UNAUTHORIZED", "Session expired. Please log in again.");
  }

  let data: WrappedResponse<T>;
  try {
    data = (await response.json()) as WrappedResponse<T>;
  } catch {
    throw new ApiError(
      "PARSE_ERROR",
      "Unexpected response format from server.",
    );
  }

  if (data.error) {
    throw new ApiError(data.error.code, data.error.message, data.error.details);
  }

  if (!("data" in data)) {
    throw new ApiError("NO_DATA", "API response missing data field");
  }

  return data.data as T;
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  return parseApiResponse<T>(await requestApi(endpoint, options), endpoint);
}

export interface UploadOptions {
  targetRole?: string;
  parentJobId?: string;
  jdText?: string;
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  if (options.targetRole) {
    formData.append("target_role", options.targetRole);
  }
  if (options.parentJobId) {
    formData.append("parent_job_id", options.parentJobId);
  }
  if (options.jdText) {
    formData.append("jd_text", options.jdText);
  }

  return apiFetch<{ job_id: string }>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getJobResults(jobId: string): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`/jobs/${jobId}/results`);
}
