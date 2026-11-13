"use client";

import FullReportView from "@/components/app-report/full-report-view";
import type { useAppWorkspaceData } from "@/hooks/use-app-workspace-data";
import type { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import type { useDraftSave } from "@/hooks/use-draft-save";
import type { WorkspaceView } from "./workspace-header";
import type { WorkspaceTab } from "./workspace-panel";
import { WorkspaceEditorContainer } from "./workspace-editor-container";
import { WorkspacePanelContainer } from "./workspace-panel-container";
import { WorkspacePdf } from "./workspace-pdf";
import styles from "./workspace-styles";

interface Props {
  jobId: string;
  view: WorkspaceView;
  tab: WorkspaceTab;
  navigate: (key: "view" | "tab", value: string) => void;
  data: ReturnType<typeof useAppWorkspaceData>;
  edits: ReturnType<typeof useAppWorkspaceEdits>;
  draft: ReturnType<typeof useDraftSave>;
  onExport: () => void;
}

export function WorkspaceBody({
  jobId,
  view,
  tab,
  navigate,
  data,
  edits,
  draft,
  onExport,
}: Props) {
  const hydration = data.hydration.data;
  const fileName = hydration?.file.filename ?? "Your CV";
  return (
    <>
      {view === "report" && <FullReportView jobId={jobId} />}
      <div className={styles.grid} hidden={view === "report"}>
        <div hidden={view !== "editor"}>
          <WorkspaceEditorContainer
            jobId={jobId}
            data={data}
            edits={edits}
            draft={draft}
          />
        </div>
        {view === "pdf" &&
          (data.file.isLoading ? (
            <p role="status">Loading original file…</p>
          ) : data.file.error ? (
            <p role="alert">Original file unavailable for this CV.</p>
          ) : (
            <WorkspacePdf
              jobId={jobId}
              url={data.file.data?.file_url ?? null}
            />
          ))}
        <WorkspacePanelContainer
          jobId={jobId}
          tab={tab}
          fileName={fileName}
          data={data}
          edits={edits}
          navigate={navigate}
          onExport={onExport}
        />
      </div>
    </>
  );
}
