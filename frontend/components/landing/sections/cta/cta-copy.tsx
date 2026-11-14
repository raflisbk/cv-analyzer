import Link from "next/link";
import PlaneIcon from "../plane-icon";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
import base from "../section.module.css";
import styles from "./cta.module.css";

export default function CtaCopy() {
  return (
    <div className={styles.copy}>
      <span data-cta-tag className={styles.tag}>
        Free to try
      </span>
      <h2>
        Ready when your{" "}
        <span className={pen.target}>
          CV is
          <PenUnderline variant={1} />
        </span>
      </h2>
      <p>Upload it now. Your first report is ready before your coffee cools.</p>
      <div className={styles.actions}>
        <Link href="/app" className={`${base.button} ${styles.primary}`}>
          Score my CV <PlaneIcon size={52} />
        </Link>
        <a href="#report" className={styles.sample}>
          See a sample report
        </a>
      </div>
    </div>
  );
}
