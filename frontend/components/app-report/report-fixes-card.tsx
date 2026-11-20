import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportFixesCard({
  data,
  fixHref,
}: {
  data: ReportDetail;
  fixHref: string;
}) {
  const { t } = useT();
  return (
    <section className={`${styles.card} ${styles.yellow} ${styles.span4}`}>
      <ReportHeading
        title={t("appReport.fixesCard.title", { count: data.fixes.length })}
        helpKey="fixesCard"
      />
      <div className={styles.bars}>
        {data.dimensions.slice(0, 3).map((dimension) => (
          <div key={dimension.key}>
            <div className={styles.barLabel}>
              <span>{t(`appReport.dimensions.${dimension.key}`)}</span>
              <span>
                {dimension.score} → {dimension.projected}
              </span>
            </div>
            <span className={styles.track}>
              <i style={{ width: `${dimension.score}%` }} />
            </span>
          </div>
        ))}
      </div>
      <div className={styles.fixList}>
        {!data.fixes.length && <p>{t("appReport.fixesCard.none")}</p>}
        {data.fixes.map((fix) => (
          <div key={fix.title}>
            <b>+{fix.points}</b>
            <span>{fix.text}</span>
          </div>
        ))}
      </div>
      <p>
        {t("appReport.fixesCard.projected")}{" "}
        <strong>
          {data.score} → {data.projectedScore}
        </strong>
      </p>
      <a className={`${styles.pill} ${styles.punk}`} href={fixHref}>
        {t("appReport.fixesCard.review")}
      </a>
    </section>
  );
}
