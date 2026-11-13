import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

function token(payload: string) {
  return `abcdefghij.${payload.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")}.abcdefghij`;
}

function request(cookie?: string) {
  return new NextRequest("http://localhost/app/reports?tab=fixes", {
    headers: cookie ? { cookie: `access_token=${cookie}` } : {},
  });
}

describe("app route protection", () => {
  it.each([
    undefined,
    "bad",
    token("not-json"),
    token(btoa(JSON.stringify({ exp: 1 }))),
  ])("redirects an absent, malformed or expired token to restore", (cookie) => {
    const response = middleware(request(cookie));
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/session/restore");
    expect(location.searchParams.get("next")).toBe("/app/reports?tab=fixes");
    expect(location.searchParams.get("attempt")).toBe("1");
  });

  it("passes a future access token", () => {
    const payload = btoa(JSON.stringify({ exp: Date.now() / 1000 + 60 }));
    expect(middleware(request(token(payload))).status).toBe(200);
  });
});
