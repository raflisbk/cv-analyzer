"use client";

import { useState } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import { useAppWorkspaceNavigation } from "@/hooks/use-app-workspace-navigation";
import { useDraftSave } from "@/hooks/use-draft-save";
import { WorkspacePageHeader } from "./workspace-page-header";
import { WorkspacePageState } from "./workspace-page-state";
import { WorkspacePageExport } from "./workspace-page-export";
import { WorkspacePageError } from "./workspace-page-error";
import styles from "./workspace-styles";

function refreshAnalysis(queryClient: QueryClient, jobId: string) {
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
}

export function WorkspacePage({ jobId }: { jobId: string }) {
  const queryClient = useQueryClient();
  const data = useAppWorkspaceData(jobId);
  const draft = useDraftSave(jobId);
  const navigation = useAppWorkspaceNavigation();
  const [exportOpen, setExportOpen] = useState(false);
  const hydration = data.hydration.data;
  const edits = useAppWorkspaceEdits(
    jobId,
    hydration?.document.source_text ?? "",
    data.results.data?.suggestions ?? hydration?.analysis.suggestions,
    data.grammar.data,
  );
  return (
    <main className={styles.page}>
      <WorkspacePageHeader
        data={data}
        draft={draft}
        navigation={navigation}
        onExport={() => setExportOpen(true)}
      />
      <WorkspacePageState
        jobId={jobId}
        data={data}
        edits={edits}
        draft={draft}
        navigation={navigation}
        onExport={() => setExportOpen(true)}
        onComplete={() => refreshAnalysis(queryClient, jobId)}
      />
      <WorkspacePageExport
        jobId={jobId}
        edits={edits}
        open={exportOpen}
        close={() => setExportOpen(false)}
      />
      <WorkspacePageError data={data} />
    </main>
  );
}
