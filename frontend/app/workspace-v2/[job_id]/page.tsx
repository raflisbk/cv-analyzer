import type { Metadata } from "next";
import { getWorkspaceHydration } from "@/lib/workspace";
import { WorkspaceV2Shell } from "@/components/workspace-v2/shell";

interface WorkspaceV2PageProps {
  params: Promise<{ job_id: string }>;
}

export const metadata: Metadata = {
  title: "Path Karir | CV Analyzer",
};

export default async function WorkspaceV2Page({ params }: WorkspaceV2PageProps) {
  const { job_id } = await params;

  const hydration = await getWorkspaceHydration(job_id);

  // Use proxy endpoint for PDF to avoid CORS issues with R2 presigned URLs
  const proxyUrl = `/api/v1/jobs/${job_id}/file/proxy`;

  return (
    <WorkspaceV2Shell
      jobId={job_id}
      hydration={hydration}
      initialPdfUrl={proxyUrl}
    />
  );
}
