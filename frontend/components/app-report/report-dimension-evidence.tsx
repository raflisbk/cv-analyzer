import { useT } from "@/components/i18n/i18n-provider";
import type { ReportDimension } from "@/lib/app-api/report-detail.types";
import styles from "./report.module.css";

export function ReportDimensionEvidence({
  evidence,
  fixHref,
}: {
  evidence: ReportDimension["evidence"];
  fixHref: string;
}) {
  const { t } = useT();
  return (
    <details className={styles.evidence}>
      <summary>
        {t("appReport.dimensions.evidence", {
          count: evidence.length,
        })}
      </summary>
      <ul>
        {evidence.map((item) => (
          <li key={item.text} data-positive={item.positive}>
            <div>
              {item.text}
              <small>{item.note}</small>
            </div>
            <a className={styles.mini} href={fixHref}>
              {t("appReport.dimensions.fix")}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
