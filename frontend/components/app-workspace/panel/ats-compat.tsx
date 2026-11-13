import type { AtsData } from "@/lib/app-api/ats.types";
import styles from "../workspace-styles";
import { parserConfidence } from "@/lib/app-workspace/parser-confidence";

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
            <span>
              {parserConfidence(confidence) === 0 ? "not found" : value}
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
        {!data.parsed.length && <p>No fields were extracted.</p>}
      </section>
    </>
  );
}
