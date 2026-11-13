import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { atsFixture } from "./fixtures/ats";
import type { AtsData } from "./ats.types";

export function getAts(jobId: string): Promise<AtsData> {
  return USE_APP_MOCKS
    ? Promise.resolve(atsFixture)
    : apiFetch(`/jobs/${encodeURIComponent(jobId)}/ats`);
}
