import type { RefObject } from "react";
import type { useAppWorkspaceInlineRewrite } from "@/hooks/use-app-workspace-inline-rewrite";
import { InlineEditPrompt } from "./inline-edit-prompt";
import { InlineEditPreview } from "./inline-edit-preview";
import { InlineEditHeading } from "./inline-edit-heading";
import styles from "./workspace-styles";

interface Props {
  dialogRef: RefObject<HTMLDivElement | null>;
  selectedText: string;
  rect: DOMRect;
  onClose: () => void;
  rewrite: ReturnType<typeof useAppWorkspaceInlineRewrite>;
}

export function InlineEditDialog({
  dialogRef,
  selectedText,
  rect,
  onClose,
  rewrite,
}: Props) {
  return (
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
      <InlineEditHeading onClose={onClose} />
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
    </div>
  );
}
