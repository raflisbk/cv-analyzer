import type { ExportTemplate } from "@/lib/app-api/export.types";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./export-dialog.module.css";

interface Props {
  templates: ExportTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function TemplateList({
  templates,
  selectedId,
  onSelect,
}: Props) {
  const { t } = useT();
  return (
    <div
      className={styles.list}
      role="radiogroup"
      aria-label={t("appExport.templates")}
    >
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          className={styles.template}
          role="radio"
          aria-checked={selectedId === template.id}
          onClick={() => onSelect(template.id)}
        >
          <span className={styles.thumbnail} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>{template.name}</strong>
            <small>{template.description}</small>
            <span className={styles.badge}>
              {t("appExport.atsBadge", { score: template.atsScore ?? "" })}
            </span>
            {template.original && (
              <span className={styles.originalBadge}>
                {t("appExport.yourUpload")}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
