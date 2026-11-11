import Link from "next/link";
import type { CvSummary } from "@/lib/app-api/cvs.types";
import { fileMeta } from "@/lib/app-shell/format";
import styles from "./cvs.module.css";

export default function CvCard({ cv }: { cv: CvSummary }) {
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
        <small>{fileMeta(cv.targetRole, cv.updatedAt, "edited")}</small>
      </div>
      {cv.score !== null && (
        <span className={styles.score} aria-label={`Score ${cv.score}`}>
          {cv.score}
        </span>
      )}
      <div className={styles.actions}>
        <Link href={`/app/cvs/${cv.jobId}?view=report`}>Report</Link>
        <Link href={`/app/cvs/${cv.jobId}?view=editor`}>Edit</Link>
      </div>
    </article>
  );
}
