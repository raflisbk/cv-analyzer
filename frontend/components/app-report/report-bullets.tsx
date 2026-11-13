"use client";

import { useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const { hasMore, scrollMore } = useAppReportScrollAssist(ref, filter);
  return (
    <section
      className={`${styles.card} ${styles.span12}`}
      id="report-bullets"
      aria-label="All bullets"
    >
      <ReportHeading
        title={`All bullets · ${bullets.length}`}
        helpKey="bullets"
      />
      <div className={styles.filter} aria-label="Filter bullets">
        {(["all", "weak", "fair", "strong"] as const).map((kind) => (
          <button
            type="button"
            key={kind}
            aria-pressed={filter === kind}
            onClick={() => setFilter(kind)}
          >
            {kind[0].toUpperCase() + kind.slice(1)}{" "}
            {kind === "all"
              ? bullets.length
              : bullets.filter((item) => item.strength === kind).length}
          </button>
        ))}
      </div>
      <div className={styles.scrollArea} ref={ref}>
        <div className={styles.bulletTable}>
          {bullets
            .filter((item) => filter === "all" || item.strength === filter)
            .map((bullet) => (
              <div className={styles.bulletRow} key={bullet.text}>
                <span className={styles.meter}>{bullet.strength}</span>
                <p>
                  {bullet.text}
                  <small>{bullet.source}</small>
                </p>
                <span className={styles.bulletTags}>
                  {bullet.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </span>
                <a className={styles.mini} href={fixHref}>
                  Fix this
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
          More ↓
        </button>
      )}
    </section>
  );
}
