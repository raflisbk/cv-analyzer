export function isChatRoute(pathname: string | null): boolean {
  return pathname === "/app" || Boolean(pathname?.startsWith("/app/chat"));
}
