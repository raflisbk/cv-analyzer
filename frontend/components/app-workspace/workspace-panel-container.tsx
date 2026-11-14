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
function showAnchor(
  navigate: Props["navigate"],
  anchorId: string,
  section?: string,
) {
  navigate("view", "editor");
  requestAnimationFrame(() => showWorkspaceAnchor(anchorId, section));
}
function panelQueryState(data: Props["data"]) {
  const scores =
    data.results.data?.scores ?? data.hydration.data?.analysis.scores;
  const hasFixes = Boolean(data.hydration.data?.analysis.suggestions);
  return {
    scores,
    reportError: Boolean(data.results.error && !scores),
    fixesError: Boolean(data.results.error && !hasFixes),
    fixesLoading: data.results.isLoading && !hasFixes,
  };
}
function retryFixQueries(data: Props["data"]) {
  void data.results.refetch();
  void data.hydration.refetch();
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
  return (
    <WorkspacePanel
      jobId={jobId}
      fileName={fileName}
      tab={tab}
      setTab={(next) => navigate("tab", next)}
      {...panelQueryState(data)}
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
      onShow={(anchorId, section) => showAnchor(navigate, anchorId, section)}
      retryReport={() => void data.results.refetch()}
      retryFixes={() => retryFixQueries(data)}
      retryAts={() => void data.ats.refetch()}
      retryGrammar={() => void data.grammar.refetch()}
      retryHistory={() => void data.history.refetch()}
    />
  );
}
