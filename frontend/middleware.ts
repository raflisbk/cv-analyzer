import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/workspace-v2", "/results"];

function isTokenStructureValid(token: string): boolean {
  if (!token || token.length < 10) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  for (const part of parts) {
    if (part.length === 0) return false;
  }

  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("access_token");
  if (!token || !isTokenStructureValid(token.value)) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login", "required");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace-v2/:path*", "/results/:path*"],
};
