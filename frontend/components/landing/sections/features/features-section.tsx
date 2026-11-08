"use client";
import { features } from "@/lib/landing-features";
import { useLandingStory } from "@/hooks/use-landing-story";
import { featuresMotion } from "@/components/landing/motion/features";
import base from "../section.module.css";
import styles from "./features.module.css";
export default function FeaturesSection() {
  const ref = useLandingStory(featuresMotion, 120);
  return <section ref={ref} id="features" className={`${base.panel} ${base.snow} ${styles.grid}`}>
    <div className={`${base.head} ${styles.head}`}><h2>Inside CV Analyzer</h2><span className={base.hand}>no spreadsheets needed</span></div>
    {features.map((feature, i) => <article className={`${styles.card} ${styles[`card${i}`]}`} key={feature.title}>
      <h3>{feature.title}</h3><p>{feature.description}</p><img className={base.object} src={`/landing/3d/${feature.image}.webp`} alt="" aria-hidden="true" />
    </article>)}
  </section>;
}
