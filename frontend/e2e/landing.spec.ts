import { test, expect } from "@playwright/test";

test.describe("Landing page (/)", () => {
  test("renders hero section, navbar, and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("navigates to CV Analyzer page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/cv-analyzer"]');
    await expect(page).toHaveURL(/\/cv-analyzer$/);
    await expect(
      page.getByRole("heading", { name: /deserves.*better/i })
    ).toBeVisible();
  });
});

test.describe("CV Analyzer page (/cv-analyzer)", () => {
  test("renders hero heading and CTA links", async ({ page }) => {
    await page.goto("/cv-analyzer");
    await expect(
      page.getByRole("heading", { name: /Your CV/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Analyze My CV" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start CV analysis" })
    ).toBeVisible();
  });

  test("renders features section with 3 features", async ({ page }) => {
    await page.goto("/cv-analyzer");
    await expect(page.locator("#cva-features-heading")).toHaveText(
      "What CV Analyzer can do"
    );
    await expect(page.getByText("AI Scoring", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Skill Gap Analysis", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Job Match Comparison", { exact: true })
    ).toBeVisible();
  });

  test("renders How It Works with 4 steps", async ({ page }) => {
    await page.goto("/cv-analyzer");
    await expect(page.locator("#cva-hiw-heading")).toHaveText("How It Works");
    const steps = ["Upload", "Analyze", "Compare", "Export"];
    for (const step of steps) {
      await expect(
        page
          .locator("p.font-extrabold")
          .filter({ hasText: new RegExp(`^${step}$`) })
          .first()
      ).toBeVisible();
    }
  });

  test("both CTA links point to workspace upload", async ({ page }) => {
    await page.goto("/cv-analyzer");
    const textLink = page.getByRole("link", { name: "Analyze My CV" });
    const iconLink = page.getByRole("link", { name: "Start CV analysis" });
    await expect(textLink).toHaveAttribute("href", "/workspace-v2/new");
    await expect(iconLink).toHaveAttribute("href", "/workspace-v2/new");
  });

  test("Back to Path Karir navigates home", async ({ page }) => {
    await page.goto("/cv-analyzer");
    await page.getByRole("link", { name: "Back to Path Karir" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Job Finding page (/job-finding)", () => {
  test("renders coming soon with email form", async ({ page }) => {
    await page.goto("/job-finding");
    await expect(
      page.getByRole("heading", { name: "Job Finding" })
    ).toBeVisible();
    await expect(
      page.getByLabel("Email address for early access notification")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Notify Me" })
    ).toBeVisible();
  });
});

test.describe("CV Builder page (/cv-builder)", () => {
  test("renders placeholder page without crashing", async ({ page }) => {
    await page.goto("/cv-builder");
    await expect(page.locator("body")).toBeVisible();
  });
});
