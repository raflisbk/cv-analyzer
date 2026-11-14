"use client";
import Image from "next/image";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import { useLandingStory } from "@/hooks/use-landing-story";
import { statsMotion } from "@/components/landing/motion/stats";
import { useLandingExpand } from "@/hooks/use-landing-expand";
import base from "../section.module.css";
import styles from "./stats.module.css";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";

const stats = [
  {
    value: landingFacts.scoreDimensions,
    label: "scored dimensions",
    image: "cubes",
  },
  {
    value: landingFacts.atsCheckCount,
    label: "ATS checks",
    image: "scanner",
  },
  {
    value: landingFacts.exportTemplateCount,
    label: "export templates",
    image: "pdf-export",
  },
];

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
          <b data-value={stat.value} data-suffix="">
            {formatLandingCount(stat.value)}
          </b>
          <span>
            {stat.label === "ATS checks" ? (
              <span className={pen.target}>
                ATS checks
                <PenUnderline variant={2} onDark />
              </span>
            ) : (
              stat.label
            )}
          </span>
        </div>
      ))}
    </section>
  );
}
