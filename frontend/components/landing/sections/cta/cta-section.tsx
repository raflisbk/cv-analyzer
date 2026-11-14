"use client";
import Link from "next/link";
import ScoreRing from "@/components/landing/product-demos/score-ring";
import RewriteDemo from "@/components/landing/product-demos/rewrite-demo";
import { useLandingStory } from "@/hooks/use-landing-story";
import { ctaMotion } from "@/components/landing/motion/cta";
import { useLandingExpand } from "@/hooks/use-landing-expand";
import base from "../section.module.css";
import PlaneIcon from "../plane-icon";
import styles from "./cta.module.css";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
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
      <div className={styles.copy}>
        <span data-cta-tag className={styles.tag}>
          Free to try
        </span>
        <h2>
          Ready when your{" "}
          <span className={pen.target}>
            CV is
            <PenUnderline variant={1} />
          </span>
        </h2>
        <p>
          Upload it now. Your first report is ready before your coffee cools.
        </p>
        <div className={styles.actions}>
          <Link href="/app" className={`${base.button} ${styles.primary}`}>
            Score my CV <PlaneIcon size={52} />
          </Link>
          <a href="#report" className={styles.sample}>
            See a sample report
          </a>
        </div>
      </div>
      <div className={styles.art} aria-label="Sample CV analysis and rewrite">
        <div className={styles.sampleScore}>
          <ScoreRing />
          <span>
            Samuel Samdono
            <br />
            Product Designer · Payly
          </span>
        </div>
        <RewriteDemo />
      </div>
    </section>
  );
}
