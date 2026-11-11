"use client";

import { createPortal } from "react-dom";
import { useAppWorkspaceFocusTrap } from "@/hooks/use-app-workspace-focus-trap";
import { useAppWorkspaceInlineRewrite } from "@/hooks/use-app-workspace-inline-rewrite";
import { InlineEditDialog } from "./inline-edit-dialog";

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
    <InlineEditDialog
      dialogRef={dialogRef}
      selectedText={selectedText}
      rect={rect}
      onClose={onClose}
      rewrite={rewrite}
    />,
    document.body,
  );
}
