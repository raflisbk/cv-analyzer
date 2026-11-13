"use client";

import { useCallback, useRef } from "react";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { useAppExport } from "@/hooks/use-app-export";
import ExportDialogHeader from "./export-dialog-header";
import ExportDialogContent from "./export-dialog-content";
import styles from "./export-dialog.module.css";

export interface ExportDialogProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
  fixIds?: string[];
  answers?: Record<string, Record<string, string>>;
}

export default function ExportDialog({
  jobId,
  open,
  onClose,
  fixIds,
  answers,
}: ExportDialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useAppShellFocusTrap(open, panel, close);
  const state = useAppExport(jobId, fixIds, answers);
  if (!open) {
    return null;
  }
  return (
    <div
      className={styles.scrim}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panel}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
      >
        <ExportDialogHeader onClose={onClose} />
        <ExportDialogContent state={state} onClose={onClose} />
      </div>
    </div>
  );
}
