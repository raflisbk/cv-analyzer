import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { AtsData } from "@/lib/app-api/ats.types";
import { AtsCompat } from "./ats-compat";
import { AtsChecks } from "./ats-checks";
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
      <div className={styles.paneHead}>
        <Image
          className={styles.pathy}
          src={pathyPoseSrc("detective")}
          alt=""
          width={72}
          height={72}
        />
        <div>
          <div className={styles.row}>
            <span className={styles.eyebrow}>ATS check</span>
            <HelpButton helpKey="ats" />
          </div>
          <h2>{data.score} of 100 ATS-ready</h2>
          <p className={styles.muted}>{data.summary}</p>
        </div>
      </div>
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
