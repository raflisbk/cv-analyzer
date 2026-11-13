import type { ExportTemplate } from "@/lib/app-api/export.types";
import { exportFilename } from "@/lib/app-export/download";
import styles from "./export-options.module.css";

interface Props {
  template: ExportTemplate;
  fileName: string;
  downloading: boolean;
  error: string | null;
  onDownload: (anchor: HTMLElement) => void;
  onCancel: () => void;
}

export default function ExportOptions({
  template,
  fileName,
  downloading,
  error,
  onDownload,
  onCancel,
}: Props) {
  return (
    <aside className={styles.side}>
      <div className={styles.scoreCard}>
        <span className={styles.score}>{template.atsScore}</span>
        <div>
          <strong>{template.name}</strong>
          <small>{template.description}</small>
        </div>
      </div>
      <ul className={styles.traits}>
        {template.traits.map((trait) => (
          <li key={trait}>
            <span aria-hidden="true">✓</span>
            {trait}
          </li>
        ))}
      </ul>
      {template.original && (
        <p className={styles.note}>
          Your uploaded layout is preserved in the final export. Only applied
          fixes change.
        </p>
      )}
      <div className={styles.format}>
        <span>Format</span>
        <strong>PDF</strong>
        <small>A4 · selectable text</small>
      </div>
      <div className={styles.actions}>
        <small>{exportFilename(fileName, template.id)}</small>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button
          type="button"
          className={styles.download}
          disabled={downloading}
          onClick={(event) => onDownload(event.currentTarget)}
        >
          {downloading
            ? "Preparing PDF…"
            : error
              ? "Retry download"
              : "Download PDF"}
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </aside>
  );
}
