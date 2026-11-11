import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsChecks({ data }: { data: AtsData }) {
  const groups = Array.from(new Set(data.checks.map((check) => check.group)));
  return (
    <>
      <section className={styles.detailBox}>
        <h3 className={styles.eyebrow}>
          Plain-text view, what the system reads
        </h3>
        <pre className={styles.plain}>
          {data.plainText.lines.map((line, index) => (
            <span
              key={index}
              className={line.flagged ? styles.flag : undefined}
            >
              {line.text}
              {"\n"}
            </span>
          ))}
        </pre>
        <p className={styles.muted}>{data.plainText.note}</p>
      </section>
      <section className={styles.detailBox}>
        <h3 className={styles.eyebrow}>Checks</h3>
        {groups.map((group) => (
          <details
            className={styles.group}
            key={group}
            open={group === "Format"}
          >
            <summary>{group}</summary>
            {data.checks
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
      <div className={styles.check}>
        <span className={styles.checkIcon}>
          {data.hiddenText.found ? "!" : "✓"}
        </span>
        {data.hiddenText.found
          ? `Hidden text found: ${data.hiddenText.items.join(", ")}`
          : "No hidden text found"}
      </div>
    </>
  );
}
