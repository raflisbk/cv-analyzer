import HeroObjects from "./hero-objects";
import HeroCopy from "./hero-copy";
import HeroWaves from "./hero-waves";
import Navbar from "@/components/landing/navbar";
import styles from "./hero.module.css";
import announcementStyles from "./hero-announcement.module.css";

export default function HeroSection() {
  return (
    <>
      <div className={announcementStyles.announcement}>
        <span>
          CV Analyzer is live.
          <span className={announcementStyles.announcementMore}>
            {" "}
            CV Builder and Job Connect are on the way.
          </span>
        </span>
        <a href="#products">See the tools</a>
      </div>
      <Navbar />
      <section id="hero" className={styles.hero} data-landing-hero>
        <HeroWaves />
        <div className={styles.body}>
          <HeroCopy />
          <HeroObjects />
        </div>
      </section>
    </>
  );
}
