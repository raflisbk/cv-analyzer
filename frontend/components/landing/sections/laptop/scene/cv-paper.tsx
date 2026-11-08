import CvHeader from "./cv-header";
import CvSidebar from "./cv-sidebar";
import CvMain from "./cv-main";
import styles from "./paper.module.css";

export default function CvPaper() {
  return (
    <article
      className={styles.paper}
      data-sc-paper
      aria-label="Sample CV of Samuel Samdono"
    >
      <CvHeader />
      <CvSidebar />
      <CvMain />
      <i className={styles.highlight} data-sc-highlight aria-hidden="true" />
    </article>
  );
}
