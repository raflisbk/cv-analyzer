import { ApiError } from "@/lib/api";

export async function responseError(
  response: Response,
  fallback: string,
): Promise<ApiError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return new ApiError("REQUEST_FAILED", fallback);
  }
  if (payload && typeof payload === "object") {
    if (
      "error" in payload &&
      payload.error &&
      typeof payload.error === "object" &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
    ) {
      return new ApiError("REQUEST_FAILED", payload.error.message);
    }
    if ("detail" in payload && typeof payload.detail === "string") {
      return new ApiError("REQUEST_FAILED", payload.detail);
    }
  }
  return new ApiError("REQUEST_FAILED", fallback);
}
