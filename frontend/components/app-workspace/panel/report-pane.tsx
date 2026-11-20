import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import type { ScoreResult } from "@/lib/types";
import { ScoreBar } from "../score-bar";
import { ReportChecks } from "./report-checks";
import { ReportStatus } from "./report-status";
import styles from "../workspace-styles";

interface Props {
  scores: ScoreResult | null | undefined;
  error?: boolean;
  retry?: () => void;
  openFixes: () => void;
  fixCount: number;
  bonus: number;
}

export function ReportPane({
  scores,
  error,
  retry,
  openFixes,
  fixCount,
  bonus,
}: Props) {
  const { t } = useT();
  if (!scores || error) {
    return <ReportStatus error={error} retry={retry} />;
  }
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <span className={styles.eyebrow}>
          {t("appWorkspacePanel.report.overall")}
        </span>
        <HelpButton helpKey="paneReport" />
      </div>
      <h2 className={styles.big}>
        {Math.min(100, scores.overall + bonus)}{" "}
        <small>{t("appWorkspacePanel.report.ofHundred")}</small>
      </h2>
      <ScoreBar
        label={t("appWorkspacePanel.report.impact")}
        score={scores.impact}
      />
      <ScoreBar
        label={t("appWorkspacePanel.report.clarity")}
        score={scores.clarity}
      />
      <ScoreBar
        label={t("appWorkspacePanel.report.relevance")}
        score={scores.relevance}
      />
      <ScoreBar
        label={t("appWorkspacePanel.report.completeness")}
        score={scores.completeness}
      />
      <ReportChecks fixCount={fixCount} />
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={openFixes}
      >
        {t("appWorkspacePanel.report.review", { count: fixCount })}
      </button>
    </div>
  );
}
