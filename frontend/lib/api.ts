/**
 * API client utilities for backend communication
 */

import { WrappedResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch wrapper that handles wrapped response format
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const isFormData = options?.body instanceof FormData;

  try {
    const response = await fetch(url, {
      ...options,
      headers: isFormData
        ? options?.headers // Let browser set Content-Type + boundary for FormData
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
    
    if (!data.data) {
      throw new ApiError(
        "NO_DATA",
        "API response missing data field"
      );
    }
    
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or parsing error
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error"
    );
  }
}

/**
 * Upload file to backend
 */
export async function uploadFile(file: File): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  
  return apiFetch<{ job_id: string }>("/upload", {
    method: "POST",
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  });
}
