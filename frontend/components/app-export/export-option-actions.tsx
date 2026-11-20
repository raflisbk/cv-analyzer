import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
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
        <ul aria-label={t("appExport.skippedFixes")} aria-live="polite">
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
          ? t("appExport.preparing", { format })
          : error
            ? t("appExport.retryDownload")
            : t("appExport.download", { format })}
      </button>
      <button type="button" className={styles.cancel} onClick={onCancel}>
        {t("appExport.cancel")}
      </button>
    </div>
  );
}
