import { useT } from "@/components/i18n/i18n-provider";
import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsCheckGroups({ checks }: { checks: AtsData["checks"] }) {
  const { t } = useT();
  const groups = Array.from(new Set(checks.map((check) => check.group)));
  return (
    <section className={styles.detailBox}>
      <h3 className={styles.eyebrow}>{t("appWorkspacePanel.ats.checks")}</h3>
      {groups.map((group) => (
        <details className={styles.group} key={group} open={group === "Format"}>
          <summary>{group}</summary>
          {checks
            .filter((check) => check.group === group)
            .map((check) => (
              <div className={styles.check} key={check.label}>
                <span className={styles.checkIcon}>
                  {check.status === "pass" ? "✓" : "!"}
                </span>
                {check.label}
              </div>
            ))}
        </details>
      ))}
    </section>
  );
}
