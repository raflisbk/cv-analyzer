

import { WrappedResponse } from "./types";
import type { AnalysisResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const isFormData = options?.body instanceof FormData;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: isFormData
        ? undefined
        : {
            "Content-Type": "application/json",
            ...options?.headers,
          },
    });
    
    const data: WrappedResponse<T> = await response.json();
    
    if (data.error) {
      throw new ApiError(
        data.error.code,
        data.error.message,
        data.error.details
      );
    }
    
    if (!('data' in data)) {
      throw new ApiError(
        "NO_DATA",
        "API response missing data field"
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error"
    );
  }
}

export async function uploadFile(file: File): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  
  return apiFetch<{ job_id: string }>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getJobResults(jobId: string): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`/jobs/${jobId}/results`);
}
