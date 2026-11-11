import type { Dimensions } from "@/lib/app-api/reports.types";
import styles from "./reports.module.css";

export default function DimensionBars({ values }: { values: Dimensions }) {
  return (
    <div className={styles.bars}>
      {(Object.entries(values) as [keyof Dimensions, number][]).map(
        ([key, score]) => (
          <div key={key} className={styles.bar}>
            <div>
              <span>{key[0].toUpperCase() + key.slice(1)}</span>
              <span>{score}</span>
            </div>
            <b>
              <i data-low={key === "impact"} style={{ width: `${score}%` }} />
            </b>
          </div>
        ),
      )}
    </div>
  );
}
