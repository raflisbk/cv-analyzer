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
  const score =
    keywords.total > 0
      ? Math.round((keywords.present.length / keywords.total) * 100)
      : 0;
  return (
    <section
      className={`${styles.card} ${styles.keywordCard} ${styles.span6}`}
      id="report-keywords"
      aria-label="Role keywords"
    >
      <ReportHeading title="Keywords for this role" helpKey="keywords" />
      <div className={styles.dimTop}>
        <ScoreRing score={score} />
        <p>
          {keywords.present.length} of {keywords.total} keywords from typical
          job posts are on your CV.
        </p>
      </div>
      <div className={styles.chips}>
        {!keywords.present.length && <p>No matching keywords found yet.</p>}
        {keywords.present.map((keyword) => (
          <span className={styles.chip} key={keyword.name}>
            {keyword.name} ×{keyword.count}
          </span>
        ))}
      </div>
      <h2>Missing keywords</h2>
      <p className={styles.caption}>Add only skills you actually have.</p>
      <div className={styles.chips}>
        {!keywords.missing.length && <p>No missing keywords identified.</p>}
        {keywords.missing.map((keyword) => (
          <a
            href={fixHref}
            className={`${styles.chip} ${styles.missing}`}
            key={keyword.name}
          >
            {keyword.name}
            {keyword.posts > 0 ? ` · ${keyword.posts} of 10 posts` : ""} +
          </a>
        ))}
      </div>
    </section>
  );
}
