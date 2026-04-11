import type { Metadata } from "next";
import { WorkspaceEntry } from "@/components/workspace/workspace-entry";

export const metadata: Metadata = {
  title: "Workspace | CV Analyzer",
  description: "Edit and refine your CV with AI-powered suggestions.",
};

interface WorkspacePageProps {
  params: Promise<{
    job_id: string;
  }>;
}

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const { job_id: jobId } = await params;

  return <WorkspaceEntry jobId={jobId} />;
}
