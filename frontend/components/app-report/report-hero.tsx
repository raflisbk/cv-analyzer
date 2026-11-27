"use client";

import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import { useAppReportFormat } from "@/hooks/use-app-report-format";
import { usePathy } from "@/components/pathy/pathy-context";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { reportFixActionLabel } from "./fix-action-label";
import { reportFixAction } from "@/lib/app-report/fix-action";
import { reportFixTitle, reportVerdict } from "@/lib/app-report/copy";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import { ReportHeading } from "./report-heading";
import styles from "./report.module.css";

export function ReportHero({
  data,
  jobId,
}: {
  data: ReportDetail;
  jobId: string;
}) {
  const pathy = usePathy();
  const { t } = useT();
  const { delta } = useAppReportFormat();
  const verdict = reportVerdict(t, data.verdict);
  return (
    <section
      className={`${styles.card} ${styles.hero} ${styles.span12}`}
      id="report-overview"
      aria-labelledby="report-verdict"
    >
      <div>
        <ReportHeading
          title={t("appReport.hero.verdict", {
            file: data.fileName,
            version: data.version,
          })}
          helpKey="verdict"
        />
        <h2 id="report-verdict">
          {verdict.title
            .split(/(strong|kuat)/i)
            .map((part, index) =>
              ["strong", "kuat"].includes(part.toLowerCase()) ? (
                <mark key={index}>{part}</mark>
              ) : (
                part
              ),
            )}
        </h2>
        <p>{verdict.body}</p>
        <div className={styles.heroPathy}>
          <Image src="/pathy/idea.webp" alt="" width={130} height={150} />
          <span className={styles.bubble}>{t("appReport.hero.bubble")}</span>
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
              <strong>{reportFixTitle(t, fix)}</strong>
              <span>{fix.text}</span>
            </div>
            <a
              href={reportFixAction(fix, jobId, index).href}
              className={`${styles.pill} ${index === 0 ? styles.punk : styles.snow}`}
            >
              {reportFixActionLabel(
                t,
                reportFixAction(fix, jobId, index).label,
              )}
            </a>
          </li>
        ))}
      </ol>
      {reportDeltaChip(data, t, delta)}
    </section>
  );
}

function reportDeltaChip(
  data: ReportDetail,
  t: ReturnType<typeof useT>["t"],
  delta: (value: number) => string,
) {
  if (data.versions.length < 2) {
    return null;
  }
  return (
    <span className={styles.chip}>
      {USE_APP_MOCKS ? t("appReport.hero.sampleAnalysis") : ""}
      {t("appReport.hero.since", {
        delta: delta(data.score - data.previousScore),
      })}
    </span>
  );
}
