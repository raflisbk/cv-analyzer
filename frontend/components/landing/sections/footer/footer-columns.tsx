"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Link from "next/link";
import { footerColumns } from "@/lib/landing-footer";
import styles from "./footer.module.css";

export default function FooterColumns() {
  const { t } = useT();
  return (
    <div className={styles.columns}>
      {footerColumns.map((column) => (
        <nav
          data-footer-column
          aria-label={t(`landing.footer.columns.${column.key}`)}
          key={t(`landing.footer.columns.${column.key}`)}
        >
          <h2>{t(`landing.footer.columns.${column.key}`)}</h2>
          <ul>
            {column.links.map((link) => (
              <li key={t(`landing.footer.columns.${link.key}`)}>
                {link.href ? (
                  <Link href={link.href}>
                    {t(`landing.footer.columns.${link.key}`)}
                  </Link>
                ) : (
                  <span>
                    {t(`landing.footer.columns.${link.key}`)}
                    {link.key !== "privacy" && (
                      <small>{t("landing.footer.soon")}</small>
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
