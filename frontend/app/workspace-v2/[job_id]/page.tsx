import type { Metadata } from "next";
import { getWorkspaceHydration, getJobFileUrl } from "@/lib/workspace";
import { WorkspaceV2Shell } from "@/components/workspace-v2/shell";

interface WorkspaceV2PageProps {
  params: Promise<{ job_id: string }>;
}

export const metadata: Metadata = {
  title: "Path Karir | CV Analyzer",
};

export default async function WorkspaceV2Page({ params }: WorkspaceV2PageProps) {
  const { job_id } = await params;

  // Fetch hydration dan file URL secara paralel (PDF-03: defaults to optimized view)
  const [hydration, fileUrlResult] = await Promise.allSettled([
    getWorkspaceHydration(job_id),
    getJobFileUrl(job_id),
  ]);

  const hydratedData = hydration.status === "fulfilled" ? hydration.value : null;
  const pdfUrl = fileUrlResult.status === "fulfilled" ? fileUrlResult.value.file_url : null;

  return (
    <WorkspaceV2Shell
      jobId={job_id}
      hydration={hydratedData}
      initialPdfUrl={pdfUrl}
    />
  );
}
