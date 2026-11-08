"use client";
import Image from "next/image";
import { stats } from "@/lib/landing-stats";
import { useLandingStory } from "@/hooks/use-landing-story";
import { statsMotion } from "@/components/landing/motion/stats";
import { useLandingExpand } from "@/hooks/use-landing-expand";
import base from "../section.module.css";
import styles from "./stats.module.css";
export default function StatsSection() {
  const ref = useLandingStory(statsMotion, 90, undefined, {
    start: "top 92%",
    end: "bottom top",
  });
  const expandRef = useLandingExpand("sheet");
  return (
    <section
      ref={(node) => {
        ref.current = node;
        expandRef.current = node;
      }}
      id="stats"
      aria-label="CV Analyzer at a glance"
      className={`${base.panel} ${base.red} ${styles.grid}`}
    >
      {stats.map((stat) => (
        <div data-stat className={styles.stat} key={stat.label}>
          <Image
            width={360}
            height={360}
            className={base.object}
            src={`/landing/3d/${stat.image}.webp`}
            alt=""
            aria-hidden="true"
          />
          <b data-value={stat.value} data-suffix={stat.suffix}>
            {stat.value}
            {stat.suffix}
          </b>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
