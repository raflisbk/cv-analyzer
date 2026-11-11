import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("app route protection", () => {
  it("redirects a visitor without a token to login", () => {
    const response = middleware(
      new NextRequest("http://localhost/app/reports"),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("login=required");
  });
  it("allows an app request with a structured token", () => {
    const request = new NextRequest("http://localhost/app/cvs", {
      headers: { cookie: "access_token=abcdefghij.abcdefghij.abcdefghij" },
    });
    expect(middleware(request).status).toBe(200);
  });
});
