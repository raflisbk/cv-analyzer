import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { historyFixture, historyDiffFixture } from "./fixtures/history";
import type { VersionData, VersionDiff } from "./history.types";

export function getVersions(jobId: string): Promise<VersionData[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(historyFixture)
    : apiFetch(`/jobs/${jobId}/versions`);
}

export function getVersionDiff(
  jobId: string,
  versionId: string,
): Promise<VersionDiff[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(historyDiffFixture)
    : apiFetch(`/jobs/${jobId}/versions/${versionId}/diff`);
}
