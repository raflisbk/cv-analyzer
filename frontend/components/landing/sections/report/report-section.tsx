"use client";
import Link from "next/link";
import { scoreBars } from "@/lib/landing-report";
import { useLandingStory } from "@/hooks/use-landing-story";
import { reportMotion } from "@/components/landing/motion/report";
import base from "../section.module.css";
import styles from "./report.module.css";

export default function ReportSection() {
  const ref = useLandingStory(reportMotion, 120);
  return <section ref={ref} id="report" className={`${base.panel} ${base.snow} ${styles.layout}`}>
    <div><h2>Your score, with receipts</h2><p>Every number comes with the exact line that earned or cost it, and a rewrite you can accept in one click.</p>
      <Link href="/workspace-v2/new" className={base.button}>Try it on my CV <span aria-hidden="true">↗</span></Link>
      <span className={`${base.hand} ${styles.note}`}>no mystery scores</span>
      <img data-report-object className={styles.gauge} src="/landing/3d/gauge.webp" alt="" aria-hidden="true" />
    </div>
    <div className={styles.visual}><img data-report-object className={styles.star} src="/landing/3d/star.webp" alt="" aria-hidden="true" />
      <div data-report-card className={styles.card} role="img" aria-label="Sample score report: overall 86, with four dimension bars and one flagged line">
        <div className={styles.top}><div className={styles.ring}><svg viewBox="0 0 130 130" aria-hidden="true"><circle cx="65" cy="65" r="54" fill="none" stroke="#544b49" strokeWidth="14"/><circle data-ring cx="65" cy="65" r="54" fill="none" stroke="var(--brand-punk)" strokeWidth="14" strokeLinecap="round" strokeDasharray="292 340"/></svg><b>86</b></div>
          <div className={styles.bars}>{scoreBars.map((bar) => <div className={styles.bar} key={bar.label}><span>{bar.label}</span><i><i data-score-bar={bar.value} style={{ width: `${bar.value}%` }} /></i><span>{bar.value}</span></div>)}</div>
        </div>
        <div data-rewrite className={styles.rewrite}><span className={styles.flag}>No number</span><s>Led a team of developers on the checkout rebuild.</s><strong>Led 6 engineers on the checkout rebuild, cutting load time 40%.</strong><span className={styles.chip}>Accept rewrite</span></div>
      </div>
    </div>
  </section>;
}
