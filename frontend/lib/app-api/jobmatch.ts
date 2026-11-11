import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { jobMatchFixture } from "./fixtures/jobmatch";
import type { JobMatchData } from "./jobmatch.types";

export function matchJob(
  jobId: string,
  jobDescription: string,
): Promise<JobMatchData> {
  return USE_APP_MOCKS
    ? Promise.resolve(jobMatchFixture)
    : apiFetch(`/jobs/${jobId}/job-match`, {
        method: "POST",
        body: JSON.stringify({ jobDescription }),
      });
}
