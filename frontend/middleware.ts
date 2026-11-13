import { NextRequest, NextResponse } from "next/server";

const BASE64URL = /^[A-Za-z0-9_-]+$/;

function isTokenStructureValid(token: string): boolean {
  if (!token || token.length < 10) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  for (const part of parts) {
    if (part.length === 0 || !BASE64URL.test(part)) {
      return false;
    }
  }

  return true;
}

function hasValidAccessToken(token?: string): boolean {
  if (!token || !isTokenStructureValid(token)) return false;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload)) as { exp?: unknown };
    return typeof claims.exp === "number" && claims.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  if (hasValidAccessToken(request.cookies.get("access_token")?.value)) {
    return NextResponse.next();
  }
  const restoreUrl = new URL("/session/restore", request.url);
  restoreUrl.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  restoreUrl.searchParams.set("attempt", "1");
  return NextResponse.redirect(restoreUrl);
}

export const config = {
  matcher: ["/app/:path*"],
};
