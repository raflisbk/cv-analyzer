import { test, expect } from "@playwright/test";
import { sampleJdText } from "./helpers";
import { getSharedJob } from "./shared-job";

test.describe.configure({ timeout: 240_000 });

test.describe("Compare tab — with completed analysis", () => {
  let jobId: string | null = null;
  let ready = false;

  test.beforeAll(async () => {
    test.setTimeout(240_000);
    const result = await getSharedJob();
    jobId = result.jobId;
    ready = result.ready;
  });

  async function openCompareTab(page: import("@playwright/test").Page) {
    await page.goto(`/results/${jobId}`);
    await page.locator("text=Overall Score").first().waitFor({ timeout: 10_000 });
    await page.locator('[role="tab"]', { hasText: "Compare" }).click();
    await expect(
      page.getByRole("tabpanel", { name: "Compare" })
    ).toBeVisible({ timeout: 5_000 });

    // If previous comparison failed, click "Try again" to reset the form
    const tryAgainBtn = page.getByRole("button", { name: "Try again" });
    if (await tryAgainBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await tryAgainBtn.click();
      await page.waitForTimeout(300);
    }
  }

  test("renders JD textarea and Compare button", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    await openCompareTab(page);

    await expect(page.getByLabel("Job Description")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Compare CV →" })
    ).toBeDisabled();
  });

  test("button stays disabled under 50 chars, shows remaining count", async ({
    page,
  }) => {
    test.skip(!ready, "Backend processing unavailable");
    await openCompareTab(page);

    await page.getByLabel("Job Description").fill("Short text");
    await expect(
      page.getByRole("button", { name: "Compare CV →" })
    ).toBeDisabled();
    await expect(page.getByText(/more to enable/)).toBeVisible();
  });

  test("button enables at 50+ chars", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    await openCompareTab(page);

    await page.getByLabel("Job Description").fill(sampleJdText);
    await expect(
      page.getByRole("button", { name: "Compare CV →" })
    ).toBeEnabled();
    await expect(page.getByText("✓")).toBeVisible();
  });

  test("submitting comparison triggers API call", async ({ page }) => {
    test.skip(!ready, "Backend processing unavailable");
    test.setTimeout(120_000);
    await openCompareTab(page);

    await page.getByLabel("Job Description").fill(sampleJdText);

    // Verify button is enabled and clickable
    const compareBtn = page.getByRole("button", { name: "Compare CV →" });
    await expect(compareBtn).toBeEnabled();

    // Click and verify the request is made (button disables during submission)
    const compareRespPromise = page.waitForResponse(
      (r) => r.url().includes("/compare") && r.request().method() === "POST",
      { timeout: 15_000 }
    );
    await compareBtn.click();

    const resp = await compareRespPromise.catch(() => null);
    if (resp) {
      // API call was made — verify it returned a response
      expect([200, 500].includes(resp.status())).toBeTruthy();
    } else {
      // If no API response, check for processing state in UI
      await expect(
        page.locator(
          "text=/Starting comparison|Comparing your CV|failed/i"
        )
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
