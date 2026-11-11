import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import type { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import { showWorkspaceAnchor } from "@/lib/app-workspace/show-anchor";
import { WorkspacePanel, type WorkspaceTab } from "./workspace-panel";

interface Props {
  jobId: string;
  tab: WorkspaceTab;
  fileName: string;
  data: ReturnType<typeof useAppWorkspaceData>;
  edits: ReturnType<typeof useAppWorkspaceEdits>;
  navigate: (key: "view" | "tab", value: string) => void;
  onExport: () => void;
}
export function WorkspacePanelContainer({
  jobId,
  tab,
  fileName,
  data,
  edits,
  navigate,
  onExport,
}: Props) {
  const scores =
    data.results.data?.scores ?? data.hydration.data?.analysis.scores;
  return (
    <WorkspacePanel
      jobId={jobId}
      fileName={fileName}
      tab={tab}
      setTab={(next) => navigate("tab", next)}
      scores={scores}
      fixes={edits.fixes}
      bonus={edits.bonus}
      ats={data.ats.data}
      atsError={data.ats.error}
      grammar={data.grammar.data}
      grammarError={data.grammar.error}
      versions={data.history.data}
      historyError={data.history.error}
      resolvedGrammar={edits.resolvedGrammar}
      onApply={edits.applyFix}
      onAddSkill={edits.addSkill}
      onExport={onExport}
      onGrammar={edits.onGrammar}
      onShow={(anchorId) => {
        navigate("view", "editor");
        requestAnimationFrame(() => showWorkspaceAnchor(anchorId));
      }}
    />
  );
}
