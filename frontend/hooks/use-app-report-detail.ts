"use client";

import { useQuery } from "@tanstack/react-query";
import { getReportDetail } from "@/lib/app-api/report-detail";

export function useAppReportDetail(jobId: string) {
  return useQuery({
    queryKey: ["app-report-detail", jobId],
    queryFn: () => getReportDetail(jobId),
  });
}
