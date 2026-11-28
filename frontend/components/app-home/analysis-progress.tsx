"use client";

import { useAppShellAnalysisProgress } from "@/hooks/use-app-shell-analysis-progress";
import ProgressCard from "@/components/app-chat/progress-card";
import AnalysisScoreCard from "./analysis-score-card";
import styles from "./home-thread.module.css";

export default function AnalysisProgress({
  jobId,
  onComplete,
}: {
  jobId: string;
  onComplete?: () => void;
}) {
  const { active, message, failed, complete, count } =
    useAppShellAnalysisProgress(jobId, onComplete);
  return (
    <section className={styles.progress} aria-live="polite">
      <ProgressCard active={active} message={message} failed={failed} />
      {complete && <AnalysisScoreCard jobId={jobId} count={count} />}
    </section>
  );
}
