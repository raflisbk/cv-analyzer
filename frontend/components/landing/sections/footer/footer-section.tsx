"use client";
import Link from "next/link";
import { useLandingStory } from "@/hooks/use-landing-story";
import { footerMotion } from "@/components/landing/motion/footer";
import PlaneIcon from "../plane-icon";
import base from "../section.module.css";
import styles from "./footer.module.css";
import FooterColumns from "./footer-columns";
const footerScroll = { start: "top 92%", end: "bottom bottom" };

export default function FooterSection() {
  const ref = useLandingStory(footerMotion, 60, undefined, footerScroll);
  return (
    <footer ref={ref} id="footer" className={`${base.panel} ${styles.footer}`}>
      <div className={styles.top}>
        <div data-footer-column className={styles.brand}>
          <p>Know what your CV says before a recruiter does.</p>
          <Link className={base.button} href="/app">
            Score my CV <PlaneIcon size={52} />
          </Link>
        </div>
        <FooterColumns />
      </div>
      <div data-footer-bottom className={styles.bottom}>
        © {new Date().getFullYear()} pathkr. Your CV stays yours.
      </div>
    </footer>
  );
}
