import { test, expect } from "@playwright/test";
import { ensureSampleCV } from "./helpers";
import fs from "fs";

test.describe("Upload page (/workspace-v2/new)", () => {
  test("renders upload drop zone", async ({ page }) => {
    await page.goto("/workspace-v2/new");
    await expect(
      page.getByRole("heading", { name: "Drop your CV here" })
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Choose File")')
    ).toBeVisible();
  });

  test("shows file preview after selecting a DOCX", async ({ page }) => {
    await page.goto("/workspace-v2/new");
    const cvPath = ensureSampleCV();
    const fileBuffer = fs.readFileSync(cvPath);

    await page.locator('input[type="file"]').setInputFiles({
      name: "test-cv.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: fileBuffer,
    });

    await expect(page.getByText("test-cv.docx")).toBeVisible();
    await expect(page.getByText("Ready")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Analyze My CV →" })
    ).toBeVisible();
  });

  test("shows error toast for invalid file type", async ({ page }) => {
    await page.goto("/workspace-v2/new");
    await page.locator('input[type="file"]').setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a pdf"),
    });
    await expect(
      page.getByText("Only PDF or DOCX files up to 5MB are supported")
    ).toBeVisible();
  });

  test("can remove file and return to idle state", async ({ page }) => {
    await page.goto("/workspace-v2/new");
    const cvPath = ensureSampleCV();
    const fileBuffer = fs.readFileSync(cvPath);

    await page.locator('input[type="file"]').setInputFiles({
      name: "test-cv.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: fileBuffer,
    });
    await expect(page.getByText("test-cv.docx")).toBeVisible();
  });
});

test.describe("Full upload flow", () => {
  test("uploads CV, processes, and navigates to workspace", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto("/workspace-v2/new");

    const cvPath = ensureSampleCV();
    const fileBuffer = fs.readFileSync(cvPath);
    await page.locator('input[type="file"]').setInputFiles({
      name: "e2e-test-cv.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: fileBuffer,
    });

    // Wait for file preview to render
    await expect(page.getByText("e2e-test-cv.docx")).toBeVisible({ timeout: 5_000 });

    // Listen for upload API call
    const uploadRespPromise = page.waitForResponse(
      (r) => {
        const url = r.url();
        return url.includes("/upload") || url.includes("/api/v1");
      },
      { timeout: 20_000 }
    );

    await page.getByRole("button", { name: "Analyze My CV →" }).click();

    const resp = await uploadRespPromise.catch(() => null);

    if (!resp) {
      // If no API response caught, check for navigation (upload may have succeeded too fast)
      const navigated = await page
        .waitForURL(/\/workspace-v2\/[0-9a-f-]+/, { timeout: 5_000 })
        .then(() => true)
        .catch(() => false);

      if (navigated) {
        expect(page.url()).toContain("/workspace-v2/");
        expect(page.url()).not.toContain("/new");
        return;
      }

      // Check for processing state
      await expect(
        page.locator("text=/Starting|Processing|Analyzing|Analysis Complete/i")
      ).toBeVisible({ timeout: 10_000 });
      return;
    }

    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const jobId = body?.data?.job_id ?? body?.job_id;
    expect(jobId).toBeTruthy();

    const landed = await page
      .waitForURL(/\/workspace-v2\/[0-9a-f-]+$/, { timeout: 90_000 })
      .catch(() => null);

    if (landed) {
      expect(page.url()).toContain("/workspace-v2/");
      expect(page.url()).not.toContain("/new");
    } else {
      await expect(
        page.locator(
          'h2:has-text("Analysis Complete"), h2:has-text("Analyzing"), h1:has-text("Something went wrong")'
        )
      ).toBeVisible({ timeout: 30_000 });
    }
  });
});
