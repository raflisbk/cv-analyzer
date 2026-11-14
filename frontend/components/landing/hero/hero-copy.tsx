import Link from "next/link";
import Image from "next/image";
import styles from "./hero.module.css";
import buttonStyles from "./hero-button.module.css";
import PenUnderline from "../pen/pen-underline";
import pen from "../pen/pen.module.css";

export default function HeroCopy() {
  return (
    <div className={styles.copy}>
      <span className={styles.live} data-hero-live>
        <span aria-hidden="true" />
        CV Analyzer is live
      </span>
      <h1>
        <span data-hero-word>Unbox</span>{" "}
        <span data-hero-word>what your CV</span>{" "}
        <span data-hero-word>
          is really{" "}
          <span className={pen.target}>
            saying
            <PenUnderline variant={1} delay={0.4} onDark />
          </span>
        </span>
      </h1>
      <p data-hero-copy>
        Upload it. Get scored on impact, clarity and ATS in about a minute. Fix
        it in an editor that knows your numbers.
      </p>
      <Link className={buttonStyles.button} href="/app" data-hero-cta>
        <span>Score my CV</span>
        <Image
          className={buttonStyles.plane}
          src="/landing/3d/paper-plane.webp"
          width={56}
          height={56}
          alt=""
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
