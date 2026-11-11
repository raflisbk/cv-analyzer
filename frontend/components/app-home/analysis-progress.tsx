"use client";

import { useAppShellAnalysisProgress } from "@/hooks/use-app-shell-analysis-progress";
import AnalysisScoreCard from "./analysis-score-card";
import styles from "./home-thread.module.css";

const steps = ["Read", "Analyze", "Score", "Grammar", "Suggest"];
export default function AnalysisProgress({ jobId }: { jobId: string }) {
  const { active, message, failed, complete, count } =
    useAppShellAnalysisProgress(jobId);
  return (
    <section className={styles.progress} aria-live="polite">
      <p>{message ?? "Reading your CV now."}</p>
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={step}>
            <b>
              <i style={{ scale: index < active ? "1 1" : "0 1" }} />
            </b>
            {step}
          </div>
        ))}
      </div>
      {failed && (
        <p role="alert">
          Analysis could not finish. Open your CV to check its status.
        </p>
      )}
      {complete && <AnalysisScoreCard jobId={jobId} count={count} />}
    </section>
  );
}
