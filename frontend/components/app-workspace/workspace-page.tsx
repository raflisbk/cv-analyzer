"use client";

import { useState } from "react";
import { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import { useAppWorkspaceNavigation } from "@/hooks/use-app-workspace-navigation";
import { useDraftSave } from "@/hooks/use-draft-save";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceBody } from "./workspace-body";
import { ExportOverlay } from "./export-overlay";
import { WorkspaceLoadError } from "./workspace-load-error";
import styles from "./workspace-styles";

export function WorkspacePage({ jobId }: { jobId: string }) {
  const data = useAppWorkspaceData(jobId);
  const draft = useDraftSave(jobId);
  const { view, tab, navigate } = useAppWorkspaceNavigation();
  const [exportOpen, setExportOpen] = useState(false);
  const hydration = data.hydration.data;
  const scores = data.results.data?.scores ?? hydration?.analysis.scores;
  const edits = useAppWorkspaceEdits(
    jobId,
    hydration?.document.source_text ?? "",
    data.results.data?.suggestions ?? hydration?.analysis.suggestions,
    data.grammar.data,
  );
  return (
    <main className={styles.page}>
      <WorkspaceHeader
        name={hydration?.file.filename ?? "Your CV"}
        role={scores?.target_role ?? "Product Designer"}
        saveState={draft.saveState}
        view={view}
        setView={(next) => navigate("view", next)}
        onExport={() => setExportOpen(true)}
      />
      <WorkspaceBody
        jobId={jobId}
        view={view}
        tab={tab}
        navigate={navigate}
        data={data}
        edits={edits}
        draft={draft}
        onExport={() => setExportOpen(true)}
      />
      {exportOpen && (
        <ExportOverlay jobId={jobId} onClose={() => setExportOpen(false)} />
      )}
      <WorkspaceLoadError error={data.hydration.error} />
    </main>
  );
}
