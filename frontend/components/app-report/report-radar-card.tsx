import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import { ReportRadar } from "./report-radar";
import styles from "./report.module.css";

export function ReportRadarCard({ data }: { data: ReportDetail }) {
  return (
    <section className={`${styles.card} ${styles.span4}`}>
      <ReportHeading title="Shape of your CV" helpKey="radar" />
      <ReportRadar dimensions={data.dimensions} />
      <p className={styles.caption}>
        Wide on Clarity and Completeness, narrow on Impact. The thin side is
        where one fix pays most.
      </p>
    </section>
  );
}
