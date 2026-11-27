import { ApiError } from "@/lib/api";

type Translate = (key: string) => string;

const CODE_KEYS: Record<string, string> = {
  FILE_TOO_LARGE: "errors.api.fileTooLarge",
  INVALID_FILE_TYPE: "errors.api.invalidFileType",
  INVALID_MIME_TYPE: "errors.api.invalidFile",
  INVALID_FILE_STRUCTURE: "errors.api.invalidFile",
  UPLOAD_FAILED: "errors.api.uploadFailed",
  UNAUTHORIZED: "errors.api.unauthorized",
  NETWORK_ERROR: "errors.api.network",
  PARSE_ERROR: "errors.api.parse",
  EMPTY_EXPORT: "errors.api.emptyExport",
  CHAT_FAILED: "errors.api.chatFailed",
};

export function apiErrorMessage(error: unknown, t: Translate): string {
  const key = error instanceof ApiError ? CODE_KEYS[error.code] : undefined;
  return t(key ?? "errors.api.generic");
}
