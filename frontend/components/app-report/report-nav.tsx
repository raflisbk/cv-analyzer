"use client";

import { useT } from "@/components/i18n/i18n-provider";
import {
  reportSections,
  useAppReportScrollSpy,
} from "@/hooks/use-app-report-scroll-spy";
import styles from "./report.module.css";

export function ReportNav() {
  const { active, setActive } = useAppReportScrollSpy();
  const { t } = useT();
  return (
    <nav
      className={styles.nav}
      aria-label={t("appReport.nav.label")}
      data-tour="report-nav"
    >
      {reportSections.map((section) => (
        <button
          key={section}
          type="button"
          aria-current={active === section ? "location" : undefined}
          onClick={() => {
            setActive(section);
            document.getElementById(`report-${section}`)?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
              block: "start",
            });
          }}
        >
          {t(`appReport.nav.${section}`)}
        </button>
      ))}
    </nav>
  );
}
