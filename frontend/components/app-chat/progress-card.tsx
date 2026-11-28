"use client";

import { useId } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import AssistantAvatar from "./assistant-avatar";
import styles from "./progress-card.module.css";

export const PROGRESS_STEPS = [
  "read",
  "analyze",
  "score",
  "grammar",
  "suggest",
] as const;

interface ProgressCardProps {
  active: number;
  message?: string;
  failed: boolean;
}

function stepState(index: number, active: number, failed: boolean) {
  if (index < active) {
    return "done";
  }
  return index === active && !failed ? "current" : "todo";
}

export default function ProgressCard({
  active,
  message,
  failed,
}: ProgressCardProps) {
  const { t } = useT();
  const statusId = useId();
  const status = failed
    ? t("app.progress.failed")
    : (message ?? t("app.progress.reading"));
  return (
    <div
      className={styles.card}
      data-failed={failed}
      role="progressbar"
      aria-labelledby={statusId}
      aria-valuemin={0}
      aria-valuemax={PROGRESS_STEPS.length}
      aria-valuenow={Math.min(active, PROGRESS_STEPS.length)}
    >
      <div className={styles.head}>
        <AssistantAvatar />
        <p id={statusId} role={failed ? "alert" : undefined}>
          {status}
        </p>
      </div>
      <ol className={styles.steps}>
        {PROGRESS_STEPS.map((step, index) => (
          <li
            key={step}
            className={styles.step}
            data-state={stepState(index, active, failed)}
          >
            <span className={styles.mark} aria-hidden="true">
              <svg viewBox="0 0 12 12">
                <path d="M2.5 6.5l2.2 2.2 4.8-5" />
              </svg>
            </span>
            <span className={styles.label}>{t(`app.progress.${step}`)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
