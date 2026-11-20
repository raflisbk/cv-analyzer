"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useAppShellAnalysisProgress } from "@/hooks/use-app-shell-analysis-progress";
import AnalysisScoreCard from "./analysis-score-card";
import styles from "./home-thread.module.css";

const steps = ["read", "analyze", "score", "grammar", "suggest"];
export default function AnalysisProgress({
  jobId,
  onComplete,
}: {
  jobId: string;
  onComplete?: () => void;
}) {
  const { t } = useT();
  const { active, message, failed, complete, count } =
    useAppShellAnalysisProgress(jobId, onComplete);
  return (
    <section className={styles.progress} aria-live="polite">
      <p>{message ?? t("app.progress.reading")}</p>
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={step}>
            <b>
              <i style={{ scale: index < active ? "1 1" : "0 1" }} />
            </b>
            {t(`app.progress.${step}`)}
          </div>
        ))}
      </div>
      {failed && <p role="alert">{t("app.progress.failed")}</p>}
      {complete && <AnalysisScoreCard jobId={jobId} count={count} />}
    </section>
  );
}
