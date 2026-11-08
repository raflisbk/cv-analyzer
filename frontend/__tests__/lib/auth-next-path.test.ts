import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth-next-path";

describe("safeNextPath", () => {
  it("keeps a same-site relative path", () => {
    expect(safeNextPath("/results/123?tab=score")).toBe(
      "/results/123?tab=score",
    );
  });

  it.each([null, "", "//evil.example", "https://evil.example/path"])(
    "falls back for an unsafe or missing path: %s",
    (path) => {
      expect(safeNextPath(path)).toBe("/workspace-v2/new");
    },
  );
});
