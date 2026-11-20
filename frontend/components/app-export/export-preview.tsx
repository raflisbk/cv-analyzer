import type {
  ExportTemplate,
  ExportPreview as PreviewData,
} from "@/lib/app-api/export.types";
import { useT } from "@/components/i18n/i18n-provider";
import { markChangedLines } from "@/lib/app-export/preview";
import styles from "./export-preview.module.css";

interface Props {
  template: ExportTemplate;
  data: PreviewData;
}

export default function ExportPreview({ template, data }: Props) {
  const { t } = useT();
  const lines = markChangedLines(data.originalText, data.editedText);
  const format =
    template.original && data.fileName.toLowerCase().endsWith(".docx")
      ? "DOCX"
      : "PDF";
  return (
    <div className={styles.preview}>
      <p className={styles.banner}>
        {template.original
          ? t("appExport.bannerOriginal")
          : t("appExport.bannerTemplate", { name: template.name })}
      </p>
      <div
        className={`${styles.paper} ${styles[template.id]}`}
        data-template={template.id}
        aria-label={t("appExport.previewLabel", {
          name: template.name,
          format,
        })}
      >
        {lines.map((line, index) => {
          const first = index === 0;
          const heading =
            /^(contact|skills|education|experience|summary)$/i.test(line.text);
          const content = line.changed ? <mark>{line.text}</mark> : line.text;
          if (first) {
            return <h3 key={index}>{content}</h3>;
          }
          if (heading) {
            return <h4 key={index}>{content}</h4>;
          }
          return <p key={index}>{content || "\u00a0"}</p>;
        })}
      </div>
    </div>
  );
}
