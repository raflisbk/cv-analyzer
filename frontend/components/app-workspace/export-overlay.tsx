"use client";

import ExportDialog from "@/components/app-export/export-dialog";
import { useAppWorkspaceFocusTrap } from "@/hooks/use-app-workspace-focus-trap";
import styles from "./workspace-styles";

export function ExportOverlay({
  jobId,
  fixIds,
  answers,
  onClose,
}: {
  jobId: string;
  fixIds: string[];
  answers: Record<string, Record<string, string>>;
  onClose: () => void;
}) {
  const dialogRef = useAppWorkspaceFocusTrap(onClose);
  return (
    <div className={styles.scrim} onClick={onClose}>
      <div ref={dialogRef} onClick={(event) => event.stopPropagation()}>
        <ExportDialog
          jobId={jobId}
          fixIds={fixIds}
          answers={answers}
          open
          onClose={onClose}
        />
      </div>
    </div>
  );
}
