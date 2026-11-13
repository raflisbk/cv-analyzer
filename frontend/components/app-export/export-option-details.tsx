import type { ExportTemplate } from "@/lib/app-api/export.types";
import styles from "./export-options.module.css";

export default function ExportOptionDetails({
  template,
  format,
}: {
  template: ExportTemplate;
  format: string;
}) {
  return (
    <>
      <div className={styles.scoreCard}>
        <span className={styles.score}>{template.atsScore ?? "—"}</span>
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
        <strong>{format}</strong>
        <small>
          {format === "PDF" ? "A4 · selectable text" : "Editable document"}
        </small>
      </div>
    </>
  );
}
