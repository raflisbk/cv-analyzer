import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: Promise<{
    job_id: string;
  }>;
}

/**
 * Legacy workspace redirect — Phase 17 cutover.
 *
 * This route transparently redirects to /workspace-v2/{job_id}.
 * Handles existing bookmarks, shared links, or browser history.
 *
 * Temporary measure before deleting entire directory.
 */
export default async function LegacyWorkspaceRedirect({
  params,
}: WorkspacePageProps) {
  const { job_id: jobId } = await params;
  redirect(`/workspace-v2/${jobId}`);
}
