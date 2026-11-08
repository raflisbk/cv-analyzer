"use client";
import Image from "next/image";
import Link from "next/link";
import { useLandingStory } from "@/hooks/use-landing-story";
import { ctaMotion } from "@/components/landing/motion/cta";
import base from "../section.module.css";
import styles from "./cta.module.css";
export default function CtaSection() {
  const ref = useLandingStory(ctaMotion, 100);
  return (
    <section
      ref={ref}
      id="start"
      className={`${base.panel} ${base.punk} ${styles.layout}`}
    >
      <div className={styles.copy}>
        <span data-cta-tag className={styles.tag}>
          Free to try
        </span>
        <h2>Ready when your CV is</h2>
        <p>
          Upload it now. Your first report is ready before your coffee cools.
        </p>
        <div className={styles.actions}>
          <Link
            href="/workspace-v2/new"
            className={`${base.button} ${styles.primary}`}
          >
            Score my CV <span aria-hidden="true">↗</span>
          </Link>
          <a href="#report" className={styles.sample}>
            See a sample report
          </a>
        </div>
        <span className={base.hand}>no card, no spam</span>
      </div>
      <div className={styles.art} aria-hidden="true">
        {["rocket", "paper-plane", "star"].map((object) => (
          <Image
            width={360}
            height={360}
            className={base.object}
            src={`/landing/3d/${object}.webp`}
            alt=""
            key={object}
          />
        ))}
      </div>
    </section>
  );
}
