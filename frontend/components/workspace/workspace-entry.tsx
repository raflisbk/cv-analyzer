import { WorkspaceHydration } from "@/components/workspace/workspace-hydration";

interface WorkspaceEntryProps {
  jobId: string;
}

export function WorkspaceEntry({ jobId }: WorkspaceEntryProps) {
  return <WorkspaceHydration jobId={jobId} />;
}
