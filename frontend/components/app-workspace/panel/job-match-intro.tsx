import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "../workspace-styles";

export function JobMatchIntro() {
  return (
    <div className={styles.paneHead}>
      <Image
        className={styles.pathy}
        src={pathyPoseSrc("map")}
        alt=""
        width={72}
        height={72}
      />
      <div>
        <div className={styles.row}>
          <span className={styles.eyebrow}>Job match</span>
          <HelpButton helpKey="match" />
        </div>
        <h2>Paste a job, see the gap</h2>
        <p className={styles.muted}>
          Compare the job with your CV and see what is missing.
        </p>
      </div>
    </div>
  );
}
