import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsCheckGroups({ checks }: { checks: AtsData["checks"] }) {
  const groups = Array.from(new Set(checks.map((check) => check.group)));
  return (
    <section className={styles.detailBox}>
      <h3 className={styles.eyebrow}>Checks</h3>
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
