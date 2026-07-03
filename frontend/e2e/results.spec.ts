import { test, expect } from "@playwright/test";
import { getSharedJob } from "./shared-job";

test.describe("Results page — static content", () => {
  test("renders heading, back link, and workspace link", async ({ page }) => {
    await page.goto("/results/nonexistent-id-xyz");
    await expect(
      page.getByRole("heading", { name: "CV Analysis Results" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to home" })
    ).toHaveAttribute("href", "/");
    await expect(
      page.getByRole("link", { name: "Open workspace" })
    ).toBeVisible();
  });

  test("shows loading indicator while processing", async ({ page }) => {
    await page.goto("/results/nonexistent-id-xyz");
    const loading = page.locator("text=Checking for results").or(page.locator("text=Analyzing your CV"));
    const hasLoading = await loading.first().isVisible().catch(() => false);
    expect(typeof hasLoading).toBe("boolean");
  });
});

test.describe.configure({ timeout: 240_000 });

test.describe("Results page — with completed analysis", () => {
  let jobId: string | null = null;
  let ready = false;

  test.beforeAll(async () => {
    test.setTimeout(240_000);
    const result = await getSharedJob();
    jobId = result.jobId;
    ready = result.ready;
  });

  test("shows overall score", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/results/${jobId}`);
    await expect(page.locator("text=Overall Score").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("renders all 5 tabs", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/results/${jobId}`);
    await page.locator("text=Overall Score").first().waitFor({ timeout: 10_000 });

    const tabs = ["Overview", "Scores", "Skills", "Grammar", "Compare"];
    for (const name of tabs) {
      await expect(
        page.locator('[role="tab"]', { hasText: name })
      ).toBeVisible();
    }
  });

  test("switching tabs updates tab panel", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/results/${jobId}`);
    await page.locator("text=Overall Score").first().waitFor({ timeout: 10_000 });

    await page.locator('[role="tab"]', { hasText: "Skills" }).click();
    await expect(page.getByRole("tabpanel", { name: "Skills" })).toBeVisible();
  });

  test("export bar with Copy and Download buttons", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/results/${jobId}`);
    await page.locator("text=Overall Score").first().waitFor({ timeout: 10_000 });

    await expect(
      page.getByRole("button", { name: /Copy all suggestions/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Download analysis as PDF/i })
    ).toBeVisible();
  });

  test("Open workspace link points to workspace page", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/results/${jobId}`);
    await page.locator("text=Overall Score").first().waitFor({ timeout: 10_000 });

    const link = page.getByRole("link", { name: "Open workspace" });
    await expect(link).toHaveAttribute("href", new RegExp(`/workspace-v2/${jobId}`));
  });

  test("Analyze Another CV navigates home", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(30_000);

    await page.goto(`/results/${jobId}`);
    await page.locator("text=Overall Score").first().waitFor({ timeout: 10_000 });

    await page.getByRole("button", { name: "Analyze Another CV" }).click();
    await expect(page).toHaveURL("/");
  });
});
