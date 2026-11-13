"use client";

import {
  reportSections,
  useAppReportScrollSpy,
} from "@/hooks/use-app-report-scroll-spy";
import styles from "./report.module.css";

export function ReportNav() {
  const { active, setActive } = useAppReportScrollSpy();
  return (
    <nav
      className={styles.nav}
      aria-label="Report sections"
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
          {section[0].toUpperCase() + section.slice(1)}
        </button>
      ))}
    </nav>
  );
}
