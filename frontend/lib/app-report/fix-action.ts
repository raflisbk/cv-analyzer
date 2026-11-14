import type { ReportDetail } from "@/lib/app-api/report-detail.types";

type ReportFix = ReportDetail["fixes"][number];

export function reportFixAction(fix: ReportFix, jobId: string, index: number) {
  const base = `/app/cvs/${encodeURIComponent(jobId)}?view=editor`;
  const kind =
    `${fix.type ?? ""} ${fix.section ?? ""} ${fix.title}`.toLowerCase();
  if (/\bats\b/.test(kind)) {
    return { label: "See ATS checks", href: `${base}&tab=ats` };
  }
  if (/\bskills?\b/.test(kind)) {
    return { label: "Edit skills", href: `${base}&tab=fixes&section=Skills` };
  }
  return { label: "Show fix", href: `${base}&tab=fixes&fixIndex=${index}` };
}
