"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { useAppExport } from "@/hooks/use-app-export";
import TemplateList from "./template-list";
import ExportPreview from "./export-preview";
import ExportOptions from "./export-options";
import styles from "./export-dialog.module.css";

export interface ExportDialogProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

export default function ExportDialog({
  jobId,
  open,
  onClose,
}: ExportDialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onClose(), [onClose]);
  useAppShellFocusTrap(open, panel, close);
  const state = useAppExport(jobId);
  if (!open) return null;
  return (
    <div
      className={styles.scrim}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
      >
        <header className={styles.header}>
          <div>
            <span>Export</span>
            <h2 id="export-title">
              Choose an ATS template <HelpButton helpKey="exportHelp" />
            </h2>
          </div>
          <Image
            className={styles.pathy}
            src="/pathy/helpdesk.webp"
            alt=""
            width={74}
            height={90}
          />
          <button
            className={styles.close}
            type="button"
            aria-label="Close export"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        {state.templates.isLoading || state.preview.isLoading ? (
          <p role="status">Loading export preview…</p>
        ) : state.templates.isError || state.preview.isError ? (
          <p role="alert">Could not load export options. Please try again.</p>
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
              onDownload={state.download}
              onCancel={onClose}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
