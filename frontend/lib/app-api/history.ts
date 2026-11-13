import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { historyFixture, historyDiffFixture } from "./fixtures/history";
import type {
  VersionData,
  VersionDiff,
  VersionDiffResult,
} from "./history.types";

export function getVersions(jobId: string): Promise<VersionData[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(historyFixture)
    : apiFetch(`/jobs/${encodeURIComponent(jobId)}/versions`);
}

export function getVersionDiff(
  jobId: string,
  versionId: string,
): Promise<VersionDiffResult> {
  return USE_APP_MOCKS
    ? Promise.resolve(historyDiffFixture)
    : apiFetch<VersionDiff>(
        `/jobs/${encodeURIComponent(jobId)}/versions/${encodeURIComponent(versionId)}/diff`,
      );
}
