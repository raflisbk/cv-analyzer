import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/workspace-v2", "/results"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("access_token");
  if (!token) {
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
