import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import { ReportBulletDonut } from "./report-bullet-donut";
import styles from "./report.module.css";

export function ReportBulletStrength({
  bullets,
}: {
  bullets: ReportDetail["bullets"];
}) {
  const { t } = useT();
  const counts = {
    strong: bullets.filter((item) => item.strength === "strong").length,
    fair: bullets.filter((item) => item.strength === "fair").length,
    weak: bullets.filter((item) => item.strength === "weak").length,
  };
  return (
    <section
      className={`${styles.card} ${styles.span3}`}
      aria-label={t("appReport.strength.title")}
    >
      <ReportHeading title={t("appReport.strength.title")} helpKey="bullets" />
      <ReportBulletDonut counts={counts} />
      <div className={styles.legend}>
        <span>
          {counts.strong} {t("appReport.strength.strong")}
        </span>
        <span>
          {counts.fair} {t("appReport.strength.fair")}
        </span>
        <span>
          {counts.weak} {t("appReport.strength.weak")}
        </span>
      </div>
      <p className={styles.caption}>{t("appReport.strength.caption")}</p>
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
                {kind === "weak"
                  ? t("appReport.strength.weakest")
                  : t("appReport.strength.strongest")}
              </strong>
              “{item.text}”
            </div>
          )
        );
      })}
    </section>
  );
}
