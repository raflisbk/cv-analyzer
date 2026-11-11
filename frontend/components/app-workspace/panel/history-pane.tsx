"use client";

import type { VersionData } from "@/lib/app-api/history.types";
import { useAppWorkspaceHistory } from "@/hooks/use-app-workspace-history";
import { HistoryTimeline } from "./history-timeline";
import { HistoryDiff } from "./history-diff";
import { HistoryRestoreDialog } from "./history-restore-dialog";
import { HistorySummary } from "./history-summary";
import styles from "../workspace-styles";

export function HistoryPane({
  jobId,
  versions,
  error,
}: {
  jobId: string;
  versions?: VersionData[];
  error?: Error | null;
}) {
  const history = useAppWorkspaceHistory(jobId);
  if (error) {
    return (
      <div role="alert">Version history could not load. Try again later.</div>
    );
  }
  if (!versions) {
    return <div role="status">Loading versions…</div>;
  }
  return (
    <div className={styles.pane}>
      <HistorySummary count={versions.length} />
      <HistoryTimeline
        versions={versions}
        onCompare={(id) => void history.compare(id)}
        onRestore={history.setRestoreId}
      />
      {history.loadError && <p role="alert">{history.loadError}</p>}
      <HistoryDiff diff={history.diff} />
      {history.restoreId && (
        <HistoryRestoreDialog
          versionId={history.restoreId}
          onCancel={() => history.setRestoreId(null)}
          onRestore={history.restore}
        />
      )}
    </div>
  );
}
