import type { AtsData } from "@/lib/app-api/ats.types";
import { AtsCompat } from "./ats-compat";
import { AtsChecks } from "./ats-checks";
import { AtsIntro } from "./ats-intro";
import styles from "../workspace-styles";

export function AtsPane({
  data,
  error,
  onExport,
}: {
  data?: AtsData;
  error?: Error | null;
  onExport: () => void;
}) {
  if (error) {
    return <div role="alert">ATS details could not load. Try again later.</div>;
  }
  if (!data) {
    return <div role="status">Loading ATS details…</div>;
  }
  return (
    <div className={styles.pane}>
      <AtsIntro score={data.score} summary={data.summary} />
      <AtsCompat data={data} />
      <AtsChecks data={data} />
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={onExport}
      >
        Switch to a single-column template
      </button>
    </div>
  );
}
