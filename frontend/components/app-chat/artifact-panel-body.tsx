"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useAppReportDetail } from "@/hooks/use-app-report-detail";
import ScoreDimensions from "./score-dimensions";
import ScoreRing from "./score-ring";
import TopFixes from "./top-fixes";
import styles from "./artifact.module.css";
import score from "./score.module.css";

export default function ArtifactPanelBody({ jobId }: { jobId: string }) {
  const { t } = useT();
  const { data, isError, refetch } = useAppReportDetail(jobId);
  if (isError) {
    return (
      <p role="alert" className={styles.error}>
        {t("app.chat.panelError")}{" "}
        <button type="button" onClick={() => refetch()}>
          {t("app.chat.panelRetry")}
        </button>
      </p>
    );
  }
  if (!data) {
    return (
      <div
        className={styles.skeleton}
        role="status"
        aria-label={t("app.chat.panelLoading")}
      >
        <i />
        <i />
        <i />
      </div>
    );
  }
  return (
    <>
      <p className={styles.file}>{data.fileName}</p>
      <div className={score.summary}>
        <ScoreRing
          score={data.score}
          label={t("app.chat.scoreOutOf", { score: data.score })}
        />
        <ScoreDimensions dimensions={data.dimensions} />
      </div>
      <TopFixes jobId={jobId} fixes={data.fixes} />
    </>
  );
}
