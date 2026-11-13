import type { ReportDetail } from "@/lib/app-api/report-detail.types";
import { ReportHeading } from "./report-heading";
import { ScoreRing } from "./score-ring";
import styles from "./report.module.css";

export function ReportAts({ ats }: { ats: ReportDetail["ats"] }) {
  return (
    <section
      className={`${styles.card} ${styles.span6}`}
      id="report-ats"
      aria-label="ATS readiness"
    >
      <ReportHeading title="ATS readiness" helpKey="atsCard" />
      <div className={styles.dimTop}>
        <ScoreRing score={ats.score} />
        <svg
          className={styles.atsDiagram}
          viewBox="0 0 200 130"
          role="img"
          aria-label="Two-column layout can be read out of order"
        >
          <rect
            x="6"
            y="6"
            width="88"
            height="118"
            rx="10"
            fill="#fdfdff"
            stroke="#b81d00"
            strokeWidth="2"
          />
          <rect
            x="106"
            y="6"
            width="88"
            height="118"
            rx="10"
            fill="#fdfdff"
            stroke="#b81d00"
            strokeWidth="2"
          />
          <path
            d="M20 28h60M20 45h55M120 28h60M120 45h55"
            stroke="#e9c9c0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M80 88C80 118 120 118 120 88"
            fill="none"
            stroke="#f42902"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          <text x="73" y="84" fill="#b81d00" fontWeight="800">
            1
          </text>
          <text x="150" y="84" fill="#b81d00" fontWeight="800">
            3
          </text>
        </svg>
      </div>
      <div className={styles.facts}>
        {!ats.facts.length && <p>No ATS details available yet.</p>}
        {ats.facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
      </div>
      <div className={styles.atsChecks}>
        {!ats.checks.length && <p>No ATS checks available yet.</p>}
        {ats.checks.map((check) => (
          <span key={check.text} data-ok={check.ok}>
            <b aria-hidden="true">{check.ok ? "✓" : "!"}</b>
            {check.text}
          </span>
        ))}
      </div>
    </section>
  );
}
