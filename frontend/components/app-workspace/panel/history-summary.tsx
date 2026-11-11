import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "../workspace-styles";

export function HistorySummary({ count }: { count: number }) {
  return (
    <div className={styles.paneHead}>
      <Image
        className={styles.pathy}
        src={pathyPoseSrc("think")}
        alt=""
        width={72}
        height={72}
      />
      <div>
        <div className={styles.row}>
          <span className={styles.eyebrow}>Version history</span>
          <HelpButton helpKey="historyTab" />
        </div>
        <h2>{count} versions saved</h2>
        <p className={styles.muted}>
          Every analysis keeps a version. Restore any time.
        </p>
      </div>
    </div>
  );
}
