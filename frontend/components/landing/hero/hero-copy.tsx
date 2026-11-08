import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./hero.module.css";

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
        <span data-hero-word>is really saying</span>
      </h1>
      <p data-hero-copy>
        Upload it. Get scored on impact, clarity and ATS in about a minute. Fix
        it in an editor that knows your numbers.
      </p>
      <Link className={styles.button} href="/workspace-v2/new" data-hero-cta>
        <span>Score my CV</span>
        <span className={styles.arrow}>
          <ArrowRight size={22} aria-hidden="true" />
        </span>
      </Link>
      <span className={styles.trust} data-hero-copy>
        Free to try. No card.
      </span>
    </div>
  );
}
