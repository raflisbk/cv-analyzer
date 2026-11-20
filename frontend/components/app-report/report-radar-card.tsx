import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import { ReportRadar } from "./report-radar";
import styles from "./report.module.css";

export function ReportRadarCard({ data }: { data: ReportDetail }) {
  const { t } = useT();
  return (
    <section className={`${styles.card} ${styles.span4}`}>
      <ReportHeading title={t("appReport.radar.title")} helpKey="radar" />
      <ReportRadar
        dimensions={data.dimensions}
        hasPrevious={data.versions.length > 1}
      />
      <p className={styles.caption}>{t("appReport.radar.caption")}</p>
    </section>
  );
}
