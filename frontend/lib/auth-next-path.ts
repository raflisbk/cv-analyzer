const DEFAULT_NEXT_PATH = "/workspace-v2/new";

export function safeNextPath(next: string | null): string {
  if (next?.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return DEFAULT_NEXT_PATH;
}
