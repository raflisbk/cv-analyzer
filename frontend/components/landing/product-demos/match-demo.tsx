import { demoMatch } from "@/lib/landing-stickers";
import ScoreRing from "./score-ring";
import styles from "./demos.module.css";
import PenCircle from "../pen/pen-circle";
import pen from "../pen/pen.module.css";

export default function MatchDemo() {
  return (
    <div className={styles.match}>
      <span className={pen.target}>
        <ScoreRing score={demoMatch.score} />
        <PenCircle variant={2} delay={0.5} />
      </span>
      <div className={styles.requirements}>
        {demoMatch.requirements.map(({ label, evidence, status }) => (
          <div className={styles.requirement} key={label}>
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
