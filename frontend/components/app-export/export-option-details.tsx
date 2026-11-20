import type { ExportTemplate } from "@/lib/app-api/export.types";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./export-options.module.css";

export default function ExportOptionDetails({
  template,
  format,
}: {
  template: ExportTemplate;
  format: string;
}) {
  const { t } = useT();
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
        <p className={styles.note}>{t("appExport.originalPreserved")}</p>
      )}
      <div className={styles.format}>
        <span>{t("appExport.format")}</span>
        <strong>{format}</strong>
        <small>
          {format === "PDF" ? t("appExport.pdfMeta") : t("appExport.docxMeta")}
        </small>
      </div>
    </>
  );
}
