import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";

export function AtsCompat({ data }: { data: AtsData }) {
  return (
    <>
      <section className={styles.detailBox}>
        <h3 className={styles.eyebrow}>Works with</h3>
        {data.compat.map(({ system, rating }) => (
          <div className={styles.barHead} key={system}>
            <span>{system}</span>
            <span className={styles.dots} aria-label={`${rating} of 5`}>
              {"●".repeat(rating)}
              {"○".repeat(5 - rating)}
            </span>
          </div>
        ))}
      </section>
      <section className={styles.detailBox}>
        <h3 className={styles.eyebrow}>What a parser extracted</h3>
        {data.parsed.map(({ field, value, confidence }) => (
          <div key={field} className={styles.parserRow}>
            <span>{field}</span>
            <span>{value}</span>
            <div className={styles.parserTrack}>
              <div
                className={styles.parserFill}
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
