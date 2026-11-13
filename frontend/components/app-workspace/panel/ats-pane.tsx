import type { AtsData } from "@/lib/app-api/ats.types";
import LoadingSkeleton from "@/components/app-shell/loading-skeleton";
import { AtsCompat } from "./ats-compat";
import { AtsChecks } from "./ats-checks";
import { AtsIntro } from "./ats-intro";
import styles from "../workspace-styles";

export function AtsPane({
  data,
  error,
  retry,
  onExport,
}: {
  data?: AtsData;
  error?: Error | null;
  retry?: () => void;
  onExport: () => void;
}) {
  if (error) {
    return (
      <div role="alert">
        ATS details could not load.{" "}
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  if (!data) {
    return <LoadingSkeleton label="Loading ATS details" />;
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
