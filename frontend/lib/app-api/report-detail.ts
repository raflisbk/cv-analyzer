import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { reportDetailFixture } from "./fixtures/report-detail";
import type { ReportDetail } from "./report-detail.types";

export function getReportDetail(jobId: string): Promise<ReportDetail> {
  return USE_APP_MOCKS
    ? Promise.resolve(reportDetailFixture)
    : apiFetch<ReportDetail>(`/jobs/${encodeURIComponent(jobId)}/report`);
}
