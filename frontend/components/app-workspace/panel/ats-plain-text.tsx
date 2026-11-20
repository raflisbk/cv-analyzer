import { useT } from "@/components/i18n/i18n-provider";
import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsPlainText({
  plainText,
}: {
  plainText: AtsData["plainText"];
}) {
  const { t } = useT();
  return (
    <section className={styles.detailBox}>
      <h3 className={styles.eyebrow}>{t("appWorkspacePanel.ats.plainText")}</h3>
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
