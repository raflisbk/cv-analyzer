"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import styles from "./score.module.css";

const MAX_FIXES = 3;

export default function TopFixes({
  jobId,
  fixes,
}: {
  jobId: string;
  fixes: ReportDetail["fixes"];
}) {
  const { t } = useT();
  if (!fixes.length) {
    return null;
  }
  return (
    <section className={styles.fixes} aria-label={t("app.chat.fixesTitle")}>
      <h4>{t("app.chat.fixesTitle")}</h4>
      <ul>
        {fixes.slice(0, MAX_FIXES).map((fix) => (
          <li key={fix.title}>
            <b>{fix.title}</b>
            {fix.text}
          </li>
        ))}
      </ul>
      <Link
        className={styles.applyAll}
        href={`/app/cvs/${encodeURIComponent(jobId)}?view=editor&tab=fixes`}
      >
        {t("app.chat.applyAll")}
      </Link>
    </section>
  );
}
