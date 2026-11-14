import Link from "next/link";
import { footerColumns } from "@/lib/landing-footer";
import styles from "./footer.module.css";

export default function FooterColumns() {
  return (
    <div className={styles.columns}>
      {footerColumns.map((column) => (
        <nav data-footer-column aria-label={column.title} key={column.title}>
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
  );
}
