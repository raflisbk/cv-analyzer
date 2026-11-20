"use client";

import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  const dialogRef = useAppWorkspaceFocusTrap(onCancel);
  return (
    <div
      ref={dialogRef}
      className={styles.card}
      role="dialog"
      aria-label={t("appWorkspacePanel.history.restoreLabel")}
    >
      <p>{t("appWorkspacePanel.history.restoreBody", { id: versionId })}</p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          disabled={restoring}
          onClick={onCancel}
        >
          {t("appWorkspacePanel.history.cancel")}
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          disabled={restoring}
          onClick={onRestore}
        >
          {restoring
            ? t("appWorkspacePanel.history.restoring")
            : t("appWorkspacePanel.history.restoreAction")}
        </button>
      </div>
    </div>
  );
}
