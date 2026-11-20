import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import { ScoreRing } from "./score-ring";
import styles from "./report.module.css";

export function ReportKeywords({
  keywords,
  fixHref,
}: {
  keywords: ReportDetail["keywords"];
  fixHref: string;
}) {
  const { t } = useT();
  const score =
    keywords.total > 0
      ? Math.round((keywords.present.length / keywords.total) * 100)
      : 0;
  return (
    <section
      className={`${styles.card} ${styles.keywordCard} ${styles.span6}`}
      id="report-keywords"
      aria-label={t("appReport.keywords.label")}
    >
      <ReportHeading title={t("appReport.keywords.title")} helpKey="keywords" />
      <div className={styles.dimTop}>
        <ScoreRing score={score} />
        <p>
          {t("appReport.keywords.summary", {
            present: keywords.present.length,
            total: keywords.total,
          })}
        </p>
      </div>
      <div className={styles.chips}>
        {!keywords.present.length && <p>{t("appReport.keywords.none")}</p>}
        {keywords.present.map((keyword) => (
          <span className={styles.chip} key={keyword.name}>
            {keyword.name} ×{keyword.count}
          </span>
        ))}
      </div>
      <h2>{t("appReport.keywords.missing")}</h2>
      <p className={styles.caption}>{t("appReport.keywords.caption")}</p>
      <div className={styles.chips}>
        {!keywords.missing.length && (
          <p>{t("appReport.keywords.noneMissing")}</p>
        )}
        {keywords.missing.map((keyword) => (
          <a
            href={fixHref}
            className={`${styles.chip} ${styles.missing}`}
            key={keyword.name}
          >
            {keyword.name}
            {keyword.posts > 0
              ? t("appReport.keywords.posts", { count: keyword.posts })
              : ""}{" "}
            +
          </a>
        ))}
      </div>
    </section>
  );
}
