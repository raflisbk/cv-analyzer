import { ApiError } from "@/lib/api";
import { currentRefreshVersion, refreshSession } from "@/lib/auth-refresh";

export async function rawRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const request = () => fetch(url, { ...options, credentials: "include" });
  const version = currentRefreshVersion();
  try {
    let response = await request();
    if (response.status === 401) {
      if (currentRefreshVersion() === version) {
        await refreshSession();
      }
      response = await request();
    }
    return response;
  } catch (error) {
    throw new ApiError(
      error instanceof Error && error.message === "Session refresh failed."
        ? "UNAUTHORIZED"
        : "NETWORK_ERROR",
      error instanceof Error && error.message === "Session refresh failed."
        ? "Session expired. Please log in again."
        : error instanceof Error
          ? error.message
          : "Network unavailable.",
    );
  }
}
