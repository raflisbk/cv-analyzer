import { expect, it, vi } from "vitest";

it("uses real endpoints unless mock mode is explicitly enabled", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_MOCKS", "0");
  vi.resetModules();
  expect((await import("@/lib/app-api/mode")).USE_APP_MOCKS).toBe(false);
  vi.stubEnv("NEXT_PUBLIC_APP_MOCKS", "1");
  vi.resetModules();
  expect((await import("@/lib/app-api/mode")).USE_APP_MOCKS).toBe(true);
  vi.stubEnv("NEXT_PUBLIC_APP_MOCKS", "");
  vi.resetModules();
  expect((await import("@/lib/app-api/mode")).USE_APP_MOCKS).toBe(false);
  vi.unstubAllEnvs();
});
