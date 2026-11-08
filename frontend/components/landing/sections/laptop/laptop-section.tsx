"use client";

import { useLandingExpand } from "@/hooks/use-landing-expand";
import { useLandingLaptop } from "@/hooks/use-landing-laptop";
import LaptopStage from "./laptop-stage";
import base from "../section.module.css";
import styles from "./laptop.module.css";

export default function LaptopSection() {
  const ref = useLandingExpand("expand");
  useLandingLaptop(ref);
  return (
    <section
      id="features"
      ref={ref}
      className={`${base.panel} ${base.blush} ${styles.section}`}
    >
      <div className={styles.text} data-laptop-text>
        <h2>Open your CV</h2>
        <span className={base.hand}>scroll to open it</span>
        <p>
          Your CV is more than a PDF. Open it up and follow the highlights:
          every section of the CV gets read, rated and explained.
        </p>
        <ul className={styles.chips}>
          {["Contact", "Experience", "Skills", "Edit"].map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
      </div>
      <div className={styles.visual}>
        <LaptopStage />
      </div>
    </section>
  );
}
