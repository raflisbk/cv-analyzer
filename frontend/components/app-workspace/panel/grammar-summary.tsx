import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import styles from "../workspace-styles";

export function GrammarSummary({
  count,
  stats,
}: {
  count: number;
  stats: GrammarData["stats"];
}) {
  return (
    <>
      <div className={styles.paneHead}>
        <Image
          className={styles.pathy}
          src={pathyPoseSrc(count ? "surprised" : "love")}
          alt=""
          width={72}
          height={72}
        />
        <div>
          <div className={styles.row}>
            <span className={styles.eyebrow}>Grammar and style</span>
            <HelpButton helpKey="grammarTab" />
          </div>
          <h2>
            {count
              ? `${count} ${count === 1 ? "note" : "notes"} to review`
              : "Clean copy!"}
          </h2>
          <p className={styles.muted}>
            Spelling and grammar are worth fixing. Style notes are optional.
          </p>
        </div>
      </div>
      <div className={styles.statGrid}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className={styles.stat}>
            <b>{value}</b>
            <span>{key.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
          </div>
        ))}
      </div>
    </>
  );
}
