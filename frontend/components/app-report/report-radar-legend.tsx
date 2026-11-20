import { useT } from "@/components/i18n/i18n-provider";
import styles from "./report.module.css";

export function ReportRadarLegend({
  showPrevious,
  togglePrevious,
  canCompare,
}: {
  showPrevious: boolean;
  togglePrevious: () => void;
  canCompare: boolean;
}) {
  const { t } = useT();
  return (
    <div className={styles.legend}>
      <span>
        <i style={{ background: "#f42902" }} />
        {t("appReport.radar.current")}
      </span>
      {canCompare && (
        <button
          type="button"
          aria-pressed={showPrevious}
          onClick={togglePrevious}
        >
          ◌ {t("appReport.radar.previous")}
        </button>
      )}
    </div>
  );
}
