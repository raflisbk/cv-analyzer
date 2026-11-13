import AnalysisProgress from "@/components/app-home/analysis-progress";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import type { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import type { useAppWorkspaceNavigation } from "@/hooks/use-app-workspace-navigation";
import type { useDraftSave } from "@/hooks/use-draft-save";
import { WorkspaceBody } from "./workspace-body";

interface Props {
  jobId: string;
  data: ReturnType<typeof useAppWorkspaceData>;
  edits: ReturnType<typeof useAppWorkspaceEdits>;
  draft: ReturnType<typeof useDraftSave>;
  navigation: ReturnType<typeof useAppWorkspaceNavigation>;
  onExport: () => void;
  onComplete: () => void;
}

export function WorkspacePageState({
  jobId,
  data,
  edits,
  draft,
  navigation,
  onExport,
  onComplete,
}: Props) {
  const status = data.hydration.data?.status;
  return (
    <>
      {data.hydration.isLoading && (
        <LoadingSkeleton label="Loading workspace" />
      )}
      {status === "preparing" && (
        <AnalysisProgress jobId={jobId} onComplete={onComplete} />
      )}
      {status === "failed" && (
        <p role="alert">Analysis failed. Please try another CV.</p>
      )}
      {status === "ready" && (
        <WorkspaceBody
          jobId={jobId}
          view={navigation.view}
          tab={navigation.tab}
          navigate={navigation.navigate}
          data={data}
          edits={edits}
          draft={draft}
          onExport={onExport}
        />
      )}
    </>
  );
}
