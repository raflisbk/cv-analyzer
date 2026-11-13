import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import { ReportBulletDonut } from "./report-bullet-donut";
import styles from "./report.module.css";

export function ReportBulletStrength({
  bullets,
}: {
  bullets: ReportDetail["bullets"];
}) {
  const counts = {
    strong: bullets.filter((item) => item.strength === "strong").length,
    fair: bullets.filter((item) => item.strength === "fair").length,
    weak: bullets.filter((item) => item.strength === "weak").length,
  };
  return (
    <section
      className={`${styles.card} ${styles.span3}`}
      aria-label="Bullet strength"
    >
      <ReportHeading title="Bullet strength" helpKey="bullets" />
      <ReportBulletDonut counts={counts} />
      <div className={styles.legend}>
        <span>{counts.strong} strong</span>
        <span>{counts.fair} fair</span>
        <span>{counts.weak} weak</span>
      </div>
      <p className={styles.caption}>
        Strong bullets have a verb, a number and a result.
      </p>
      {(["weak", "strong"] as const).map((kind) => {
        const item = bullets.find((bullet) => bullet.strength === kind);
        return (
          item && (
            <div
              key={kind}
              className={styles.quote}
              data-good={kind === "strong"}
            >
              <strong>
                {kind === "weak" ? "Weakest" : "Strongest"} bullet
              </strong>
              “{item.text}”
            </div>
          )
        );
      })}
    </section>
  );
}
