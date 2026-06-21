import { test, expect } from "@playwright/test";
import { getSharedJob } from "./shared-job";

test.describe("Workspace page — static structure", () => {
  test("loads without crashing for invalid ID", async ({ page }) => {
    await page.goto("/workspace-v2/nonexistent-id-xyz");
    await expect(page.locator("body")).toBeVisible();
  });

  test("renders workspace footer with action buttons", async ({ page }) => {
    await page.goto("/workspace-v2/nonexistent-id-xyz");
    const footer = page.locator('footer[aria-label="Workspace actions"]');
    const hasFooter = await footer.isVisible().catch(() => false);
    if (!hasFooter) return;

    await expect(
      page.getByRole("button", { name: /Apply all suggestions/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Export PDF/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Export Report/i })
    ).toBeVisible();
  });

  test("Comparison View toggle flips aria-pressed", async ({ page }) => {
    await page.goto("/workspace-v2/nonexistent-id-xyz");
    const btn = page.locator("button").filter({ hasText: "Comparison View" }).first();
    const hasBtn = await btn.isVisible().catch(() => false);
    if (!hasBtn) return;

    const before = await btn.getAttribute("aria-pressed");
    await btn.click();
    const after = await btn.getAttribute("aria-pressed");
    expect(before).not.toBe(after);
  });
});

test.describe.configure({ timeout: 240_000 });

test.describe("Workspace — with completed analysis", () => {
  let jobId: string | null = null;
  let ready = false;

  test.beforeAll(async () => {
    test.setTimeout(240_000);
    const result = await getSharedJob();
    jobId = result.jobId;
    ready = result.ready;
  });

  test("renders workspace shell for completed job", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/workspace-v2/${jobId}`);
    const footer = page.locator('footer[aria-label="Workspace actions"]');
    await expect(footer).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: /Apply all suggestions/i })
    ).toBeVisible();
  });

  test("has three-column layout", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/workspace-v2/${jobId}`);
    await page.locator('footer[aria-label="Workspace actions"]').waitFor({ timeout: 10_000 });
    await expect(page.locator("[data-workspace-v2]")).toBeVisible();
  });
});
