import type {
  ExportTemplate,
  ExportPreview as PreviewData,
} from "@/lib/app-api/export.types";
import { markChangedLines } from "@/lib/app-export/preview";
import styles from "./export-preview.module.css";

interface Props {
  template: ExportTemplate;
  data: PreviewData;
}

export default function ExportPreview({ template, data }: Props) {
  const lines = markChangedLines(data.originalText, data.editedText);
  const format =
    template.original && data.fileName.toLowerCase().endsWith(".docx")
      ? "DOCX"
      : "PDF";
  return (
    <div className={styles.preview}>
      <p className={styles.banner}>
        {template.original
          ? "Only your applied fixes change; everything else stays as you wrote it."
          : `${template.name} template: your content is reflowed into this layout. Applied fixes stay highlighted.`}
      </p>
      <div
        className={`${styles.paper} ${styles[template.id]}`}
        data-template={template.id}
        aria-label={`${template.name} ${format} preview`}
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
