import { useT } from "@/components/i18n/i18n-provider";
import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";
import { parserConfidence } from "@/lib/app-workspace/parser-confidence";

export function AtsCompat({ data }: { data: AtsData }) {
  const { t } = useT();
  return (
    <>
      <section className={styles.detailBox}>
        <h3 className={styles.eyebrow}>
          {t("appWorkspacePanel.ats.worksWith")}
        </h3>
        {data.compat.map(({ system, rating }) => (
          <div className={styles.barHead} key={system}>
            <span>{system}</span>
            <span
              className={styles.dots}
              aria-label={t("appWorkspacePanel.ats.rating", { rating })}
            >
              {"●".repeat(rating)}
              {"○".repeat(5 - rating)}
            </span>
          </div>
        ))}
      </section>
      <section className={styles.detailBox}>
        <h3 className={styles.eyebrow}>{t("appWorkspacePanel.ats.parsed")}</h3>
        {data.parsed.map(({ field, value, confidence }) => (
          <div key={field} className={styles.parserRow}>
            <span>{field}</span>
            <span>
              {parserConfidence(confidence) === 0
                ? t("appWorkspacePanel.ats.notFound")
                : value}
            </span>
            <div
              className={styles.parserTrack}
              data-empty={parserConfidence(confidence) === 0}
            >
              <div
                className={styles.parserFill}
                style={{ width: `${parserConfidence(confidence)}%` }}
              />
            </div>
          </div>
        ))}
        {!data.parsed.length && <p>{t("appWorkspacePanel.ats.noFields")}</p>}
      </section>
    </>
  );
}
