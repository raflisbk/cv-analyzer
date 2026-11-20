"use client";

import { useAppWorkspaceFocusTrap } from "@/hooks/use-app-workspace-focus-trap";
import styles from "../workspace-styles";

export function HistoryRestoreDialog({
  versionId,
  restoring,
  onCancel,
  onRestore,
}: {
  versionId: string;
  restoring: boolean;
  onCancel: () => void;
  onRestore: () => void;
}) {
  const dialogRef = useAppWorkspaceFocusTrap(onCancel);
  return (
    <div
      ref={dialogRef}
      className={styles.card}
      role="dialog"
      aria-label="Restore version"
    >
      <p>
        Restore {versionId}? This adds a new version with its content and keeps
        all other versions.
      </p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          disabled={restoring}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          disabled={restoring}
          onClick={onRestore}
        >
          {restoring ? "Restoring…" : "Restore version"}
        </button>
      </div>
    </div>
  );
}
