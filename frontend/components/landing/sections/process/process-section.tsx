"use client";
import { processSteps } from "@/lib/landing-process";
import { useLandingStory } from "@/hooks/use-landing-story";
import { processMotion } from "@/components/landing/motion/process";
import base from "../section.module.css";
import styles from "./process.module.css";

function prepareProcess(panel: HTMLElement) {
  if (window.innerWidth <= 860) return;
  panel.classList.add(styles.pinned);
  if (panel.offsetHeight > window.innerHeight + 30) panel.classList.remove(styles.pinned);
  panel.dataset.processPinned = String(panel.classList.contains(styles.pinned));
}
export default function ProcessSection() {
  const ref = useLandingStory(processMotion, 450, prepareProcess);
  return <section ref={ref} id="how" className={`${base.panel} ${base.ink} ${styles.section}`}>
    <div className={base.head}><h2>How <em>CV Analyzer</em> works</h2><span className={base.hand}>six steps, about a minute</span></div>
    <div className={styles.stage}><div className={styles.items}>{processSteps.map((step, i) => <article className={styles.item} key={step.title}>
      <div className={styles.text}><span className={styles.number}>{i + 1}</span><h3>{step.title}</h3><p>{step.description}</p></div>
      <div className={styles.visual}><img className={base.object} src={`/landing/3d/${step.image}.webp`} alt="" aria-hidden="true" /><span className={styles.sticker}>{step.sticker}</span></div>
    </article>)}</div>
      <div className={styles.rail} aria-hidden="true"><div className={styles.labels}>{processSteps.map((step) => <span key={step.label}>{step.label}</span>)}</div>
        <svg viewBox="0 0 1000 60"><path data-rail-path d="M10 34 C110 4 190 64 290 34 S470 4 570 34 S750 64 850 34 S960 14 990 34" fill="none" stroke="#756d6b" strokeWidth="6" strokeLinecap="round"/><path data-rail-done d="M10 34 C110 4 190 64 290 34 S470 4 570 34 S750 64 850 34 S960 14 990 34" fill="none" stroke="var(--brand-punk)" strokeWidth="6" strokeLinecap="round"/><circle data-rider r="11" cx="10" cy="34" fill="var(--brand-punk)" stroke="var(--brand-ink)" strokeWidth="4" /></svg>
      </div>
    </div>
  </section>;
}
