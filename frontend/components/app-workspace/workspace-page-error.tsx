import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import { WorkspaceLoadError } from "./workspace-load-error";

export function WorkspacePageError({
  data,
}: {
  data: ReturnType<typeof useAppWorkspaceData>;
}) {
  return (
    <WorkspaceLoadError
      error={data.hydration.error}
      retry={() => void data.hydration.refetch()}
    />
  );
}
