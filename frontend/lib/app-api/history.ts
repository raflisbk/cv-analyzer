import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import {
  historyFixture,
  historyDiffFixture,
  restoredVersionFixture,
} from "./fixtures/history";
import type {
  RestoredVersion,
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

export function restoreVersion(
  jobId: string,
  versionId: string,
): Promise<RestoredVersion> {
  return USE_APP_MOCKS
    ? Promise.resolve(restoredVersionFixture)
    : apiFetch<RestoredVersion>(
        `/jobs/${encodeURIComponent(jobId)}/versions/${encodeURIComponent(versionId)}/restore`,
        { method: "POST" },
      );
}
