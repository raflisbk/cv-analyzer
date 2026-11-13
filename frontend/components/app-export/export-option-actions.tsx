import styles from "./export-options.module.css";

interface Props {
  fileName: string;
  format: string;
  downloading: boolean;
  error: string | null;
  resultMessage: string | null;
  onDownload: (anchor: HTMLElement) => void;
  onCancel: () => void;
}

export default function ExportOptionActions({
  fileName,
  format,
  downloading,
  error,
  resultMessage,
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
      {resultMessage && <p role="status">{resultMessage}</p>}
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
