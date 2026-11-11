"use client";

import FullReportView from "@/components/app-report/full-report-view";
import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import type { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import type { useDraftSave } from "@/hooks/use-draft-save";
import { showWorkspaceAnchor } from "@/lib/app-workspace/show-anchor";
import type { WorkspaceView } from "./workspace-header";
import type { WorkspaceTab } from "./workspace-panel";
import { WorkspaceEditor } from "./workspace-editor";
import { WorkspacePanel } from "./workspace-panel";
import { WorkspacePdf } from "./workspace-pdf";
import styles from "./workspace-styles";

export function WorkspaceBody({
  jobId,
  view,
  tab,
  navigate,
  data,
  edits,
  draft,
  onExport,
}: {
  jobId: string;
  view: WorkspaceView;
  tab: WorkspaceTab;
  navigate: (key: "view" | "tab", value: string) => void;
  data: ReturnType<typeof useAppWorkspaceData>;
  edits: ReturnType<typeof useAppWorkspaceEdits>;
  draft: ReturnType<typeof useDraftSave>;
  onExport: () => void;
}) {
  const hydration = data.hydration.data;
  const scores = data.results.data?.scores ?? hydration?.analysis.scores;
  const source = hydration?.document.source_text ?? "";
  const fileName = hydration?.file.filename ?? "Your CV";
  return (
    <>
      {view === "report" && <FullReportView jobId={jobId} />}
      <div className={styles.grid} hidden={view === "report"}>
        <div hidden={view !== "editor"}>
          <WorkspaceEditor
            jobId={jobId}
            source={source}
            draftContent={hydration?.document.draft_content?.document}
            fixes={edits.fixes}
            onChange={(content) =>
              draft.markUnsaved({ sections: { document: content } })
            }
            onEditor={edits.setEditor}
          />
        </div>
        {view === "pdf" && (
          <WorkspacePdf jobId={jobId} url={data.file.data?.file_url ?? null} />
        )}
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
      </div>
    </>
  );
}
