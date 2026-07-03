import { test as base, expect } from "@playwright/test";
import { uploadCV, waitForJobComplete } from "./helpers";

type JobFixture = {
  jobId: string | null;
  jobReady: boolean;
};

export const jobTest = base.extend<JobFixture>({
  jobId: async ({}, use) => {
    const id = await uploadCV();
    await use(id);
  },
  jobReady: async ({ jobId }, use) => {
    if (!jobId) {
      await use(false);
      return;
    }
    const ready = await waitForJobComplete(jobId, 90);
    await use(ready);
  },
});

export { expect };
