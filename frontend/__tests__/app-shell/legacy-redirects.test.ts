import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const config = require("../../next.config.js");

describe("legacy route redirects", () => {
  it.each([
    ["/workspace-v2/new", "/app"],
    ["/workspace-v2/:job_id", "/app/cvs/:job_id?view=editor"],
    ["/results/:job_id", "/app/cvs/:job_id?view=report"],
  ])("redirects %s to %s permanently", async (source, destination) => {
    const redirects = await config.redirects();
    expect(redirects).toContainEqual({ source, destination, permanent: true });
  });
});
