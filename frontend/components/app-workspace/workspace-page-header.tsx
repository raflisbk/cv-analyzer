import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import type { useAppWorkspaceNavigation } from "@/hooks/use-app-workspace-navigation";
import type { useDraftSave } from "@/hooks/use-draft-save";
import { WorkspaceHeader } from "./workspace-header";

export function WorkspacePageHeader({
  data,
  draft,
  navigation,
  onExport,
}: {
  data: ReturnType<typeof useAppWorkspaceData>;
  draft: ReturnType<typeof useDraftSave>;
  navigation: ReturnType<typeof useAppWorkspaceNavigation>;
  onExport: () => void;
}) {
  const hydration = data.hydration.data;
  const scores = data.results.data?.scores ?? hydration?.analysis.scores;
  return (
    <WorkspaceHeader
      name={hydration?.file.filename ?? "Your CV"}
      role={scores?.target_role ?? "Your CV"}
      version={data.history.data?.find((item) => item.current)?.label}
      saveState={draft.saveState}
      view={navigation.view}
      setView={(next) => navigation.navigate("view", next)}
      onExport={onExport}
    />
  );
}
