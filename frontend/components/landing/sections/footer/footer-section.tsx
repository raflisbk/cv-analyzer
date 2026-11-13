"use client";
import Link from "next/link";
import { footerColumns } from "@/lib/landing-footer";
import { useLandingStory } from "@/hooks/use-landing-story";
import { footerMotion } from "@/components/landing/motion/footer";
import PlaneIcon from "../plane-icon";
import base from "../section.module.css";
import styles from "./footer.module.css";
const footerScroll = { start: "top 92%", end: "bottom bottom" };

export default function FooterSection() {
  const ref = useLandingStory(footerMotion, 60, undefined, footerScroll);
  return (
    <footer ref={ref} id="footer" className={`${base.panel} ${styles.footer}`}>
      <div className={styles.top}>
        <div data-footer-column className={styles.brand}>
          <p>Know what your CV says before a recruiter does.</p>
          <span className={styles.note}>pathkr = path + karir</span>
          <Link className={base.button} href="/app">
            Score my CV <PlaneIcon size={52} />
          </Link>
        </div>
        <div className={styles.columns}>
          {footerColumns.map((column) => (
            <nav
              data-footer-column
              aria-label={column.title}
              key={column.title}
            >
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link href={link.href}>{link.label}</Link>
                    ) : (
                      <span>
                        {link.label}
                        {link.label !== "Your CV stays yours" && (
                          <small>soon</small>
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div data-footer-bottom className={styles.bottom}>
        © {new Date().getFullYear()} pathkr. Your CV stays yours.
      </div>
    </footer>
  );
}
