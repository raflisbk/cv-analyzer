"use client";

import { createPortal } from "react-dom";
import { useAppWorkspaceFocusTrap } from "@/hooks/use-app-workspace-focus-trap";
import { useAppWorkspaceInlineRewrite } from "@/hooks/use-app-workspace-inline-rewrite";
import { InlineEditPrompt } from "./inline-edit-prompt";
import { InlineEditPreview } from "./inline-edit-preview";
import styles from "./workspace-styles";

export function InlineEditPopover({
  jobId,
  selectedText,
  source,
  rect,
  onClose,
  onApply,
}: {
  jobId: string;
  selectedText: string;
  source: string;
  rect: DOMRect;
  onClose: () => void;
  onApply: (text: string) => void;
}) {
  const dialogRef = useAppWorkspaceFocusTrap(onClose);
  const rewrite = useAppWorkspaceInlineRewrite(
    jobId,
    selectedText,
    source,
    onApply,
  );
  return createPortal(
    <div
      ref={dialogRef}
      className={styles.popover}
      role="dialog"
      aria-label="Edit with AI"
      style={{
        left: Math.max(12, Math.min(rect.left, window.innerWidth - 392)),
        top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 280)),
      }}
    >
      <div className={styles.barHead}>
        <strong>Edit with AI</strong>
        <button type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <p className={styles.muted}>{selectedText}</p>
      {rewrite.rewrite ? (
        <InlineEditPreview
          selectedText={selectedText}
          rewrite={rewrite.rewrite}
          accept={rewrite.accept}
          retry={() => void rewrite.requestRewrite("Try another rewrite")}
        />
      ) : (
        <InlineEditPrompt
          request={(instruction) => void rewrite.requestRewrite(instruction)}
          busy={rewrite.busy}
        />
      )}
      {rewrite.error && <p role="alert">{rewrite.error}</p>}
    </div>,
    document.body,
  );
}
