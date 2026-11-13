"use client";

import { useCallback, useRef } from "react";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { useAppExport } from "@/hooks/use-app-export";
import TemplateList from "./template-list";
import ExportPreview from "./export-preview";
import ExportOptions from "./export-options";
import ExportDialogHeader from "./export-dialog-header";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
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
        {state.templates.isLoading || state.preview.isLoading ? (
          <LoadingSkeleton label="Loading export preview" />
        ) : state.templates.isError || state.preview.isError ? (
          <p role="alert">
            Could not load export options.{" "}
            <button
              type="button"
              onClick={() => {
                void state.templates.refetch();
                void state.preview.refetch();
              }}
            >
              Try again
            </button>
          </p>
        ) : state.selected && state.preview.data && state.templates.data ? (
          <div className={styles.body}>
            <TemplateList
              templates={state.templates.data}
              selectedId={state.selectedId}
              onSelect={state.setSelectedId}
            />
            <ExportPreview
              template={state.selected}
              data={state.preview.data}
            />
            <ExportOptions
              template={state.selected}
              fileName={state.preview.data.fileName}
              downloading={state.downloading}
              error={state.error}
              resultMessage={state.resultMessage}
              onDownload={state.download}
              onCancel={onClose}
            />
          </div>
        ) : (
          <p role="status">No export templates are available.</p>
        )}
      </div>
    </div>
  );
}
