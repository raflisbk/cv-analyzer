import { WorkspaceEntry } from "@/components/workspace/workspace-entry";

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
