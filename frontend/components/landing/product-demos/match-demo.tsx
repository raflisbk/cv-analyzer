import { demoMatch } from "@/lib/landing-report";
import ScoreRing from "./score-ring";
import styles from "./demos.module.css";

export default function MatchDemo() {
  return (
    <div className={styles.match}>
      <ScoreRing score={demoMatch.score} label="Job match" />
      <div className={styles.requirements}>
        {demoMatch.requirements.map(({ label, evidence, status }) => (
          <div data-demo-requirement className={styles.requirement} key={label}>
            <span className={status === "Met" ? styles.met : styles.missing}>
              {status}
            </span>
            <span>
              <strong>{label}</strong>
              <small>{evidence}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
