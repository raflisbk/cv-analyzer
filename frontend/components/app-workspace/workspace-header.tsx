"use client";

import HelpButton from "@/components/pathy/help-button";
import { ViewSwitch } from "./view-switch";
import { WorkspaceBack } from "./workspace-back";
import { WorkspaceTitle } from "./workspace-title";
import styles from "./workspace-styles";

export type WorkspaceView = "editor" | "pdf" | "report";

export function WorkspaceHeader({
  name,
  role,
  version,
  saveState,
  view,
  setView,
  onExport,
}: {
  name: string;
  role: string;
  version?: string;
  saveState: string;
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  onExport: () => void;
}) {
  return (
    <header className={styles.head}>
      <WorkspaceBack />
      <WorkspaceTitle
        name={name}
        role={role}
        version={version}
        saveState={saveState}
      />
      <ViewSwitch view={view} setView={setView} />
      <HelpButton helpKey="views" />
      <button
        type="button"
        data-tour="workspace-export"
        className={`${styles.pill} ${styles.punk}`}
        onClick={onExport}
      >
        Export ↗
      </button>
    </header>
  );
}
