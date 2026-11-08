import styles from "./main.module.css";

export default function CvExperience() {
  return (
    <section>
      <h6>Experience</h6>
      <div className={styles.job} data-sc-section="payly">
        <div className={styles.role}>
          <b>Senior Product Designer · Payly</b>
          <span>2021 to now</span>
        </div>
        <ul>
          <li className={styles.editLine} data-sc-section="edit">
            <s>Led a team of developers on the checkout rebuild.</s>
            <em>
              Led 6 engineers on the checkout rebuild, cutting load time 40%.
            </em>
            <u>No number</u>
          </li>
          <li>Improved the onboarding flow on mobile.</li>
          <li>Ran weekly design critiques.</li>
        </ul>
      </div>
      <div className={styles.job} data-sc-section="brightly">
        <div className={styles.role}>
          <b>Product Designer · Brightly</b>
          <span>2018 to 2021</span>
        </div>
        <ul>
          <li>Designed the merchant dashboard used by 1,200 shops.</li>
          <li>Built a design system shared by four product teams.</li>
        </ul>
      </div>
    </section>
  );
}
