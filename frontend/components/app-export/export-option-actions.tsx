import styles from "./export-options.module.css";

interface Props {
  fileName: string;
  format: string;
  downloading: boolean;
  error: string | null;
  resultMessage: string | null;
  reasons: { id: string; title: string; message: string }[];
  onDownload: (anchor: HTMLElement) => void;
  onCancel: () => void;
}

export default function ExportOptionActions({
  fileName,
  format,
  downloading,
  error,
  resultMessage,
  reasons,
  onDownload,
  onCancel,
}: Props) {
  return (
    <div className={styles.actions}>
      <small>{fileName}</small>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {resultMessage && (
        <p role="status" aria-live="polite">
          {resultMessage}
        </p>
      )}
      {reasons.length > 0 && (
        <ul aria-label="Skipped fixes" aria-live="polite">
          {reasons.map((reason) => (
            <li key={reason.id}>
              <strong>{reason.title}</strong>: {reason.message}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className={styles.download}
        disabled={downloading}
        onClick={(event) => onDownload(event.currentTarget)}
      >
        {downloading
          ? `Preparing ${format}…`
          : error
            ? "Retry download"
            : `Download ${format}`}
      </button>
      <button type="button" className={styles.cancel} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
