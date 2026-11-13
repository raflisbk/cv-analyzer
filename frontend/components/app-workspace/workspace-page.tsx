"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import { useAppWorkspaceNavigation } from "@/hooks/use-app-workspace-navigation";
import { useDraftSave } from "@/hooks/use-draft-save";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceBody } from "./workspace-body";
import { ExportOverlay } from "./export-overlay";
import { WorkspaceLoadError } from "./workspace-load-error";
import AnalysisProgress from "@/components/app-home/analysis-progress";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import styles from "./workspace-styles";

export function WorkspacePage({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const data = useAppWorkspaceData(jobId);
  const draft = useDraftSave(jobId);
  const { view, tab, navigate } = useAppWorkspaceNavigation();
  const [exportOpen, setExportOpen] = useState(false);
  const refreshAnalysis = () => {
    for (const key of [
      "app-workspace",
      "job-results",
      "app-ats",
      "app-grammar",
      "app-history",
      "app-file",
      "app-report-detail",
    ]) {
      void queryClient.invalidateQueries({ queryKey: [key, jobId] });
    }
  };
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
        role={scores?.target_role ?? "Your CV"}
        saveState={draft.saveState}
        view={view}
        setView={(next) => navigate("view", next)}
        onExport={() => setExportOpen(true)}
      />
      {data.hydration.isLoading && (
        <LoadingSkeleton label="Loading workspace" />
      )}
      {hydration?.status === "preparing" && (
        <AnalysisProgress jobId={jobId} onComplete={refreshAnalysis} />
      )}
      {hydration?.status === "failed" && (
        <p role="alert">Analysis failed. Please try another CV.</p>
      )}
      {hydration?.status === "ready" && (
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
      )}
      {exportOpen && (
        <ExportOverlay
          jobId={jobId}
          fixIds={edits.appliedFixIds}
          answers={edits.appliedAnswers}
          onClose={() => setExportOpen(false)}
        />
      )}
      <WorkspaceLoadError
        error={data.hydration.error}
        retry={() => void data.hydration.refetch()}
      />
    </main>
  );
}
