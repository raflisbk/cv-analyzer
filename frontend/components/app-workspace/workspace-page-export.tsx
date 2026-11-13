import type { useAppWorkspaceEdits } from "@/hooks/use-app-workspace-edits";
import { ExportOverlay } from "./export-overlay";

export function WorkspacePageExport({
  jobId,
  edits,
  open,
  close,
}: {
  jobId: string;
  edits: ReturnType<typeof useAppWorkspaceEdits>;
  open: boolean;
  close: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <ExportOverlay
      jobId={jobId}
      fixIds={edits.appliedFixIds}
      answers={edits.appliedAnswers}
      onClose={close}
    />
  );
}
