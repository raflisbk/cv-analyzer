"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { features } from "@/lib/landing-features";
import { useLandingStory } from "@/hooks/use-landing-story";
import { featuresMotion } from "@/components/landing/motion/features";
import base from "../section.module.css";
import styles from "./features.module.css";
import PenHighlight from "../../pen/pen-highlight";
import pen from "../../pen/pen.module.css";
import FeatureCard from "./feature-card";
import FactsRow from "./facts-row";
export default function FeaturesSection() {
  const { t } = useT();
  const ref = useLandingStory(featuresMotion, 120);
  const [before, after] = t("landing.features.heading").split("analyzer");
  return (
    <section
      ref={ref}
      id="inside"
      className={`${base.panel} ${base.snow} ${base.calm} ${styles.grid}`}
    >
      <div className={`${base.head} ${styles.head}`}>
        <h2>
          {before}
          <span className={pen.target}>
            analyzer
            <PenHighlight variant={0} />
          </span>
          {after}
        </h2>
      </div>
      {features.map((feature, index) => (
        <FeatureCard feature={feature} index={index} key={feature.key} />
      ))}
      <FactsRow />
    </section>
  );
}
