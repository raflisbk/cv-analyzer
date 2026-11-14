"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Link from "next/link";
import { useLandingStory } from "@/hooks/use-landing-story";
import { reportMotion } from "@/components/landing/motion/report";
import base from "../section.module.css";
import styles from "./report.module.css";
import ScoreCard from "./score-card";
import PlaneIcon from "../plane-icon";
import MarginNote from "../../pen/margin-note";
import ReportSupport from "./report-support";
import { useDemoOnce } from "@/components/landing/motion/demo-once";

export default function ReportSection() {
  const { t } = useT();
  const ref = useLandingStory(reportMotion, 120);
  useDemoOnce(ref);
  return (
    <section
      ref={ref}
      id="report"
      className={`${base.panel} ${base.snow} ${base.calm} ${styles.layout}`}
    >
      <div>
        <h2>{t("landing.report.heading")}</h2>
        <p>{t("landing.report.intro")}</p>
        <Link href="/app" className={base.button}>
          {t("landing.report.button")} <PlaneIcon size={52} />
        </Link>
      </div>
      <div className={styles.visual}>
        <div className={styles.note}>
          <MarginNote targetId="report-score-ring" variant={0}>
            {t("landing.report.note")}
          </MarginNote>
        </div>
        <ScoreCard />
      </div>
      <ReportSupport />
    </section>
  );
}
