import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  const status = data.hydration.data?.status;
  return (
    <>
      {data.hydration.isLoading && (
        <LoadingSkeleton label={t("appWorkspace.state.loading")} />
      )}
      {status === "preparing" && (
        <AnalysisProgress jobId={jobId} onComplete={onComplete} />
      )}
      {status === "failed" && (
        <p role="alert">{t("appWorkspace.state.failed")}</p>
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
