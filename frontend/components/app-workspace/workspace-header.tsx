"use client";

import HelpButton from "@/components/pathy/help-button";
import { ViewSwitch } from "./view-switch";
import styles from "./workspace-styles";

export type WorkspaceView = "editor" | "pdf" | "report";

export function WorkspaceHeader({
  name,
  role,
  saveState,
  view,
  setView,
  onExport,
}: {
  name: string;
  role: string;
  saveState: string;
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  onExport: () => void;
}) {
  return (
    <header className={styles.head}>
      <button
        type="button"
        className={`${styles.pill} ${styles.snow}`}
        aria-label="Back to My CVs"
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.assign("/app/cvs");
          }
        }}
      >
        ←
      </button>
      <div className={styles.name}>
        <div className={styles.crumb}>MY CVs / WORKSPACE</div>
        <h1 className={styles.title}>{name}</h1>
        <div className={styles.sub}>
          {role} · Version 2 ·{" "}
          {saveState === "saving"
            ? "Saving…"
            : saveState === "error"
              ? "Save failed"
              : "Saved"}
        </div>
      </div>
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
