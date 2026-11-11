export interface ExportDialogProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

export default function ExportDialog({ open, onClose }: ExportDialogProps) {
  if (!open) {
    return null;
  }
  return (
    <div role="dialog" aria-label="Export CV">
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
