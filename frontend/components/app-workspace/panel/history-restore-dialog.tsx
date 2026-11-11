"use client";

import { useAppWorkspaceFocusTrap } from "@/hooks/use-app-workspace-focus-trap";
import styles from "../workspace-styles";

export function HistoryRestoreDialog({
  versionId,
  onCancel,
  onRestore,
}: {
  versionId: string;
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
      <p>Restore {versionId}? This will replace the current draft.</p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={onRestore}
        >
          Restore version
        </button>
      </div>
    </div>
  );
}
