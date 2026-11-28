"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useAppReportDetail } from "@/hooks/use-app-report-detail";
import styles from "./artifact-card.module.css";

export default function ArtifactCard({
  jobId,
  open,
  onOpen,
}: {
  jobId: string;
  open: boolean;
  onOpen: () => void;
}) {
  const { t } = useT();
  const { data, isError } = useAppReportDetail(jobId);
  const subtitle = isError
    ? t("app.chat.artifactError")
    : (data?.fileName ?? t("app.chat.artifactLoading"));
  return (
    <div className={styles.card}>
      <span className={styles.badge} aria-hidden="true">
        {data?.score ?? "–"}
      </span>
      <div className={styles.cardText}>
        <b>{t("app.chat.artifactTitle")}</b>
        <small>{subtitle}</small>
      </div>
      <button
        type="button"
        className={styles.open}
        data-artifact-trigger
        aria-expanded={open}
        disabled={!data}
        onClick={onOpen}
      >
        {t("app.chat.artifactOpen")}
      </button>
    </div>
  );
}
