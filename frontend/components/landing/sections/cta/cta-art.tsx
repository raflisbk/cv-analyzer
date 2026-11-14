import ScoreRing from "@/components/landing/product-demos/score-ring";
import RewriteDemo from "@/components/landing/product-demos/rewrite-demo";
import styles from "./cta.module.css";

export default function CtaArt() {
  return (
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
  );
}
