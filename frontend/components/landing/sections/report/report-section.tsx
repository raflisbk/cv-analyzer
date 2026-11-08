"use client";
import Image from "next/image";
import Link from "next/link";
import { useLandingStory } from "@/hooks/use-landing-story";
import { reportMotion } from "@/components/landing/motion/report";
import base from "../section.module.css";
import styles from "./report.module.css";
import ScoreCard from "./score-card";

export default function ReportSection() {
  const ref = useLandingStory(reportMotion, 120);
  return (
    <section
      ref={ref}
      id="report"
      className={`${base.panel} ${base.snow} ${styles.layout}`}
    >
      <div>
        <h2>Your score, with receipts</h2>
        <p>
          Every number comes with the exact line that earned or cost it, and a
          rewrite you can accept in one click.
        </p>
        <Link href="/workspace-v2/new" className={base.button}>
          Try it on my CV <span aria-hidden="true">↗</span>
        </Link>
        <span className={`${base.hand} ${styles.note}`}>no mystery scores</span>
        <Image
          width={360}
          height={360}
          data-report-object
          className={styles.gauge}
          src="/landing/3d/gauge.webp"
          alt=""
          aria-hidden="true"
        />
      </div>
      <div className={styles.visual}>
        <Image
          width={360}
          height={360}
          data-report-object
          className={styles.star}
          src="/landing/3d/star.webp"
          alt=""
          aria-hidden="true"
        />
        <ScoreCard />
      </div>
    </section>
  );
}
