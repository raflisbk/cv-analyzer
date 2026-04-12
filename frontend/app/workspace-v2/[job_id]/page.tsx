import { getWorkspaceHydration } from "@/lib/workspace";
import { WorkspaceV2Shell } from "@/components/workspace-v2/shell";

interface WorkspaceV2PageProps {
  params: Promise<{ job_id: string }>;
}

export default async function WorkspaceV2Page({ params }: WorkspaceV2PageProps) {
  const { job_id } = await params;

  // Fetch hydration data — sama seperti workspace v1
  // getJobFileUrl akan di-fetch di Plan 05 setelah file URL endpoint ada
  const hydration = await getWorkspaceHydration(job_id).catch(() => null);

  return <WorkspaceV2Shell jobId={job_id} hydration={hydration} />;
}
