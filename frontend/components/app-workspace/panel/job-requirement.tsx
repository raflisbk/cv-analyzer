import { useT } from "@/components/i18n/i18n-provider";
import type { JobMatchData } from "@/lib/app-api/jobmatch.types";
import styles from "../workspace-styles";

type Requirement = JobMatchData["requirements"][number];
export function JobRequirement({
  requirement,
  onAdd,
}: {
  requirement: Requirement;
  onAdd: (skill: string) => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.check}>
      <span className={styles.checkIcon}>
        {requirement.status === "met"
          ? "✓"
          : requirement.status === "missing"
            ? "×"
            : "~"}
      </span>
      <span>
        {requirement.label} · {requirement.weight}
        {requirement.evidence && ` · ${requirement.evidence}`}
      </span>
      {requirement.status === "missing" && (
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => onAdd(requirement.label)}
        >
          {t("appWorkspacePanel.match.add")}
        </button>
      )}
    </div>
  );
}
