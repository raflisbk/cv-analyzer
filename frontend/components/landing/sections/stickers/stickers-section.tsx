"use client";
import { useLandingStory } from "@/hooks/use-landing-story";
import { stickersMotion } from "@/components/landing/motion/stickers";
import { useDemoOnce } from "@/components/landing/motion/demo-once";
import ScoreBarsDemo from "@/components/landing/product-demos/score-bars-demo";
import MatchDemo from "@/components/landing/product-demos/match-demo";
import RewriteDemo from "@/components/landing/product-demos/rewrite-demo";
import ExportDemo from "@/components/landing/product-demos/export-demo";
import base from "../section.module.css";
import styles from "./stickers.module.css";

export default function StickersSection() {
  const ref = useLandingStory(stickersMotion);
  useDemoOnce(ref);
  return (
    <section
      ref={ref}
      id="stickers"
      className={`${base.panel} ${base.punk} ${styles.section}`}
    >
      <h2>Why people stick with it</h2>
      <div className={styles.grid}>
        <article className={styles.card}>
          <h3>4 scores, 1 minute</h3>
          <ScoreBarsDemo />
        </article>
        <article className={styles.card}>
          <h3>Job match %</h3>
          <MatchDemo />
        </article>
        <article className={styles.card}>
          <h3>Smart rewrites</h3>
          <RewriteDemo />
        </article>
        <article className={styles.card}>
          <h3>Export to PDF</h3>
          <ExportDemo />
        </article>
      </div>
    </section>
  );
}
