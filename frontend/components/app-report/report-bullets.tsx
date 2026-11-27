"use client";

import { useRef, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { reportBulletTags } from "@/lib/app-report/copy";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { useAppReportScrollAssist } from "@/hooks/use-app-report-scroll-assist";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportBullets({
  bullets,
  fixHref,
}: {
  bullets: ReportDetail["bullets"];
  fixHref: string;
}) {
  const [filter, setFilter] = useState<"all" | "weak" | "fair" | "strong">(
    "all",
  );
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const { hasMore, scrollMore } = useAppReportScrollAssist(ref, filter);
  return (
    <section
      className={`${styles.card} ${styles.span12}`}
      id="report-bullets"
      aria-label={t("appReport.bullets.label")}
    >
      <ReportHeading
        title={t("appReport.bullets.title", { count: bullets.length })}
        helpKey="bullets"
      />
      <div className={styles.filter} aria-label={t("appReport.bullets.filter")}>
        {(["all", "weak", "fair", "strong"] as const).map((kind) => (
          <button
            type="button"
            key={kind}
            aria-pressed={filter === kind}
            onClick={() => setFilter(kind)}
          >
            {t(`appReport.bullets.${kind}`)}{" "}
            {kind === "all"
              ? bullets.length
              : bullets.filter((item) => item.strength === kind).length}
          </button>
        ))}
      </div>
      <div className={styles.scrollArea} ref={ref}>
        <div className={styles.bulletTable}>
          {!bullets.some(
            (item) => filter === "all" || item.strength === filter,
          ) && <p>{t("appReport.bullets.none")}</p>}
          {bullets
            .filter((item) => filter === "all" || item.strength === filter)
            .map((bullet) => (
              <div className={styles.bulletRow} key={bullet.text}>
                <span className={styles.meter}>
                  {t(`appReport.bullets.${bullet.strength}`)}
                </span>
                <p>
                  {bullet.text}
                  <small>{bullet.source}</small>
                </p>
                <span className={styles.bulletTags}>
                  {reportBulletTags(t, bullet).map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </span>
                <a className={styles.mini} href={fixHref}>
                  {t("appReport.bullets.fix")}
                </a>
              </div>
            ))}
        </div>
      </div>
      {hasMore && (
        <button
          type="button"
          className={`${styles.mini} ${styles.more}`}
          onClick={scrollMore}
        >
          {t("appReport.bullets.more")}
        </button>
      )}
    </section>
  );
}
