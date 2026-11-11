import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { reportFixtures } from "./fixtures/reports";
import type { ReportsData } from "./reports.types";

export function listReports(): Promise<ReportsData> {
  return USE_APP_MOCKS
    ? Promise.resolve(reportFixtures)
    : apiFetch<ReportsData>("/reports");
}
