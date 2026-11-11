import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsPlainText({
  plainText,
}: {
  plainText: AtsData["plainText"];
}) {
  return (
    <section className={styles.detailBox}>
      <h3 className={styles.eyebrow}>Plain-text view, what the system reads</h3>
      <pre className={styles.plain}>
        {plainText.lines.map((line, index) => (
          <span key={index} className={line.flagged ? styles.flag : undefined}>
            {line.text}
            {"\n"}
          </span>
        ))}
      </pre>
      <p className={styles.muted}>{plainText.note}</p>
    </section>
  );
}
