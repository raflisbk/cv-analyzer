"use client";
import Link from "next/link";
import { footerColumns } from "@/lib/landing-footer";
import { useLandingStory } from "@/hooks/use-landing-story";
import { footerMotion } from "@/components/landing/motion/footer";
import base from "../section.module.css";
import styles from "./footer.module.css";
export default function FooterSection() {
  const ref = useLandingStory(footerMotion, 60);
  return (
    <footer
      ref={ref}
      id="footer"
      className={`${base.panel} ${base.ink} ${styles.footer}`}
    >
      <div className={styles.top}>
        <div data-footer-column className={styles.brand}>
          <p>Know what your CV says before a recruiter does.</p>
          <Link className={base.button} href="/workspace-v2/new">
            Score my CV <span aria-hidden="true">↗</span>
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
