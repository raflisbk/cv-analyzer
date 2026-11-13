"use client";

import type { VersionData } from "@/lib/app-api/history.types";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
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
  retry,
}: {
  jobId: string;
  versions?: VersionData[];
  error?: Error | null;
  retry?: () => void;
}) {
  const history = useAppWorkspaceHistory(jobId);
  if (error) {
    return (
      <div role="alert">
        Version history could not load.{" "}
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  if (!versions) {
    return <LoadingSkeleton label="Loading versions" />;
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
