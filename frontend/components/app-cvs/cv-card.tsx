"use client";

import Link from "next/link";
import type { CvSummary } from "@/lib/app-api/cvs.types";
import { useT } from "@/components/i18n/i18n-provider";
import { fileMeta } from "@/lib/i18n/format-date";
import styles from "./cvs.module.css";

export default function CvCard({ cv }: { cv: CvSummary }) {
  const { t, locale } = useT();
  return (
    <article className={styles.card} data-tour="cv-card">
      <span className={styles.thumbnail} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <div className={styles.meta}>
        <strong>{cv.fileName}</strong>
        <small>
          {fileMeta(locale, cv.targetRole, t("app.cvs.edited"), cv.updatedAt)}
        </small>
      </div>
      {cv.score !== null && (
        <span
          className={styles.score}
          aria-label={t("app.cvs.score", { score: cv.score })}
        >
          {cv.score}
        </span>
      )}
      <div className={styles.actions}>
        <Link href={`/app/cvs/${cv.jobId}?view=report`}>
          {t("app.cvs.report")}
        </Link>
        <Link href={`/app/cvs/${cv.jobId}?view=editor`}>
          {t("app.cvs.edit")}
        </Link>
      </div>
    </article>
  );
}
