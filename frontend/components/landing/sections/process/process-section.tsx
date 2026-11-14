"use client";
import { useT } from "@/components/i18n/i18n-provider";
import { useRef } from "react";
import { processSteps } from "@/lib/landing-process";
import { useLandingStory } from "@/hooks/use-landing-story";
import { processMotion } from "@/components/landing/motion/process";
import { useProcessIris } from "./use-process-iris";
import ProcessStep from "./process-step";
import ProcessRail from "./process-rail";
import base from "../section.module.css";
import styles from "./process.module.css";

function prepareProcess(panel: HTMLElement) {
  if (window.innerWidth <= 860) {
    return;
  }
  panel.classList.add(styles.pinned);
  if (panel.offsetHeight > window.innerHeight + 30) {
    panel.classList.remove(styles.pinned);
  }
  panel.dataset.processPinned = String(panel.classList.contains(styles.pinned));
}
export default function ProcessSection() {
  const { t } = useT();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = useLandingStory(
    processMotion,
    450,
    prepareProcess,
    undefined,
    false,
    0,
  );
  useProcessIris(wrapperRef, ref);
  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <section
        ref={ref}
        id="how"
        className={`${base.panel} ${base.ink} ${styles.section}`}
      >
        <div className={base.head}>
          <h2>{t("landing.process.heading")}</h2>
          <span className={base.hand}>{t("landing.process.detail")}</span>
        </div>
        <div className={styles.stage}>
          <div className={styles.items}>
            {processSteps.map((step, index) => (
              <ProcessStep key={step.key} step={step} index={index} />
            ))}
          </div>
          <ProcessRail />
        </div>
      </section>
    </div>
  );
}
