"use client";

import Image from "next/image";
import { usePathy } from "@/components/pathy/pathy-context";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { formatDelta } from "@/lib/app-report/format";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportHero({
  data,
  fixHref,
  onExport,
}: {
  data: ReportDetail;
  fixHref: string;
  onExport: () => void;
}) {
  const pathy = usePathy();
  return (
    <section
      className={`${styles.card} ${styles.hero} ${styles.span12}`}
      id="report-overview"
      aria-labelledby="report-verdict"
    >
      <div>
        <ReportHeading
          title={`Verdict · ${data.fileName} · ${data.version}`}
          helpKey="verdict"
        />
        <h2 id="report-verdict">
          {data.verdict.title
            .split(/(strong)/i)
            .map((part, index) =>
              part.toLowerCase() === "strong" ? (
                <mark key={index}>{part}</mark>
              ) : (
                part
              ),
            )}
        </h2>
        <p>{data.verdict.body}</p>
        <div className={styles.heroPathy}>
          <Image src="/pathy/idea.webp" alt="" width={130} height={150} />
          <span className={styles.bubble}>
            Start with number 1. Easy points!
          </span>
        </div>
      </div>
      <ol className={styles.take}>
        {data.fixes.map((fix, index) => (
          <li
            key={fix.title}
            onMouseEnter={
              index === 0 ? () => pathy.react("idea", fix.text) : undefined
            }
          >
            <b>{index + 1}</b>
            <div>
              <strong>{fix.title}</strong>
              <span>{fix.text}</span>
            </div>
            {index === 2 ? (
              <button
                type="button"
                className={`${styles.pill} ${styles.snow}`}
                onClick={onExport}
              >
                Pick an ATS template
              </button>
            ) : (
              <a
                href={fixHref}
                className={`${styles.pill} ${index === 0 ? styles.punk : styles.snow}`}
              >
                {index === 0 ? "Show fix" : "Review skill"}
              </a>
            )}
          </li>
        ))}
      </ol>
      {reportDeltaChip(data)}
    </section>
  );
}

function reportDeltaChip(data: ReportDetail) {
  if (data.versions.length < 2) {
    return null;
  }
  return (
    <span className={styles.chip}>
      {USE_APP_MOCKS ? "Sample analysis · " : ""}
      {formatDelta(data.score - data.previousScore)} since previous version
    </span>
  );
}
