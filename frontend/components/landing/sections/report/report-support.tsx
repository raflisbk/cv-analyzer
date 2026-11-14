import MatchDemo from "../../product-demos/match-demo";
import ExportDemo from "../../product-demos/export-demo";
import SkillGapsDemo from "./skill-gaps-demo";
import styles from "./support.module.css";

export default function ReportSupport() {
  return (
    <div className={styles.grid}>
      <article className={styles.card}>
        <h3>Job match</h3>
        <MatchDemo />
      </article>
      <article className={styles.card}>
        <h3>ATS and export</h3>
        <ExportDemo />
      </article>
      <article className={styles.card}>
        <h3>Skill gaps</h3>
        <SkillGapsDemo />
      </article>
    </div>
  );
}
