import type { ExportTemplate } from "@/lib/app-api/export.types";
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
  return (
    <div className={styles.list} role="radiogroup" aria-label="ATS templates">
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
            <span className={styles.badge}>ATS {template.atsScore}</span>
            {template.original && (
              <span className={styles.originalBadge}>Your upload</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
