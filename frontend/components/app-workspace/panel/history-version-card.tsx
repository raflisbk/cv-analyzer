import type { VersionData } from "@/lib/app-api/history.types";
import { formatVersionDate } from "@/lib/app-workspace/format";
import styles from "../workspace-styles";

export function HistoryVersionCard({
  version,
  onCompare,
  onRestore,
}: {
  version: VersionData;
  onCompare: () => void;
  onRestore: () => void;
}) {
  return (
    <article className={styles.group}>
      <strong>
        {version.label} · {formatVersionDate(version.at)}
      </strong>{" "}
      {version.current && <span className={styles.eyebrow}>Current</span>}
      <p>
        Score {version.score}
        {version.delta !== null && ` (+${version.delta})`}. {version.summary}
      </p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={onCompare}
        >
          {version.current ? "See changes" : "Compare"}
        </button>
        {!version.current && (
          <button
            type="button"
            className={`${styles.pill} ${styles.snow}`}
            onClick={onRestore}
          >
            Restore
          </button>
        )}
      </div>
    </article>
  );
}
