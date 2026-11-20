import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportGrammar({
  grammar,
}: {
  grammar: ReportDetail["grammar"];
}) {
  const { t } = useT();
  return (
    <section
      className={`${styles.card} ${styles.span3}`}
      id="report-language"
      aria-label={t("appReport.grammar.title")}
    >
      <ReportHeading title={t("appReport.grammar.title")} helpKey="grammar" />
      <div className={styles.grammarBars}>
        {(["spelling", "grammar", "style"] as const).map((key) => (
          <div key={key}>
            <strong>{grammar[key]}</strong>
            <i style={{ height: `${Math.max(12, grammar[key] * 16)}px` }} />
            <span>{t(`appReport.grammar.${key}`)}</span>
          </div>
        ))}
      </div>
      <p className={styles.caption}>
        {t("appReport.grammar.notes", {
          count: grammar.spelling + grammar.grammar + grammar.style,
        })}
      </p>
      <div className={styles.scrollArea}>
        {!grammar.notes.length && <p>{t("appReport.grammar.none")}</p>}
        {grammar.notes.map((note) => (
          <div className={styles.note} key={note.before}>
            <s>{note.before}</s> → <b>{note.after}</b>
            <small>{note.location}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
