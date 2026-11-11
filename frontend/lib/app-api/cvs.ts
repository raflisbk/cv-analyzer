import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { cvFixtures } from "./fixtures/cvs";
import type { CvSummary } from "./cvs.types";

export function listCvs(): Promise<CvSummary[]> {
  return USE_APP_MOCKS
    ? Promise.resolve(cvFixtures)
    : apiFetch<CvSummary[]>("/cvs");
}
