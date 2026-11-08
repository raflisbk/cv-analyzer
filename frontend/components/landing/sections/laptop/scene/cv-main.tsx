import styles from "./main.module.css";
import CvExperience from "./cv-experience";

export default function CvMain() {
  return (
    <div className={styles.main}>
      <section data-sc-section="summary">
        <h6>Summary</h6>
        <p>
          Product designer with six years of experience building{" "}
          <mark>checkout</mark> and <mark>onboarding</mark> flows for{" "}
          <mark>fintech</mark> apps. Focused on measurable results.
        </p>
      </section>
      <CvExperience />
      <section data-sc-section="projects">
        <h6>Projects</h6>
        <ul>
          <li>Onboarding redesign: setup time down 38%, case study online.</li>
          <li>Checkout accessibility audit across 12 flows.</li>
        </ul>
      </section>
      <section data-sc-section="education">
        <h6>Education</h6>
        <p>BA Visual Communication · Jakarta Design Institute · 2017</p>
      </section>
    </div>
  );
}
