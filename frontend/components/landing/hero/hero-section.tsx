import HeroObjects from "./hero-objects";
import HeroCopy from "./hero-copy";
import HeroWaves from "./hero-waves";
import Navbar from "@/components/landing/navbar";
import styles from "./hero.module.css";

export default function HeroSection() {
  return (
    <>
      <div className={styles.announcement}>
        CV Analyzer is live. CV Builder and Job Connect are on the way.
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
