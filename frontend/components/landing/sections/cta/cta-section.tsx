"use client";
import { useLandingStory } from "@/hooks/use-landing-story";
import { ctaMotion } from "@/components/landing/motion/cta";
import { useLandingExpand } from "@/hooks/use-landing-expand";
import base from "../section.module.css";
import styles from "./cta.module.css";
import CtaCopy from "./cta-copy";
import CtaArt from "./cta-art";
export default function CtaSection() {
  const ref = useLandingStory(ctaMotion, 100, undefined, {
    start: "top 92%",
    end: "bottom top",
  });
  const expandRef = useLandingExpand("expand");
  return (
    <section
      ref={(node) => {
        ref.current = node;
        expandRef.current = node;
      }}
      id="start"
      className={`${base.panel} ${base.punk} ${styles.layout}`}
    >
      <CtaCopy />
      <CtaArt />
    </section>
  );
}
