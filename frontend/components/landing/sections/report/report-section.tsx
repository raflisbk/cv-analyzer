"use client";
import Link from "next/link";
import { useLandingStory } from "@/hooks/use-landing-story";
import { reportMotion } from "@/components/landing/motion/report";
import base from "../section.module.css";
import styles from "./report.module.css";
import ScoreCard from "./score-card";
import PlaneIcon from "../plane-icon";
import MarginNote from "../../pen/margin-note";

export default function ReportSection() {
  const ref = useLandingStory(reportMotion, 120);
  return (
    <section
      ref={ref}
      id="report"
      className={`${base.panel} ${base.blush} ${styles.layout}`}
    >
      <div>
        <h2>Your score, with receipts</h2>
        <p>
          Every number comes with the exact line that earned or cost it, and a
          rewrite you can accept in one click.
        </p>
        <Link href="/app" className={base.button}>
          Try it on my CV <PlaneIcon size={52} />
        </Link>
      </div>
      <div className={styles.visual}>
        <div className={styles.note}>
          <MarginNote targetId="report-score-ring" variant={0}>
            No mystery scores
          </MarginNote>
        </div>
        <ScoreCard />
      </div>
    </section>
  );
}
