"use client";
import { features } from "@/lib/landing-features";
import { useLandingStory } from "@/hooks/use-landing-story";
import { featuresMotion } from "@/components/landing/motion/features";
import base from "../section.module.css";
import styles from "./features.module.css";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
import FeatureCard from "./feature-card";
import FactsRow from "./facts-row";
export default function FeaturesSection() {
  const ref = useLandingStory(featuresMotion, 120);
  return (
    <section
      ref={ref}
      id="inside"
      className={`${base.panel} ${base.punk} ${styles.grid}`}
    >
      <div className={`${base.head} ${styles.head}`}>
        <h2>
          Inside{" "}
          <span className={pen.target}>
            CV Analyzer
            <PenUnderline variant={0} />
          </span>
        </h2>
      </div>
      {features.map((feature, index) => (
        <FeatureCard feature={feature} index={index} key={feature.title} />
      ))}
      <FactsRow />
    </section>
  );
}
