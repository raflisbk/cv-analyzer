"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./app-shell.module.css";

export default function AppNav() {
  const pathname = usePathname();
  const { t } = useT();
  const active = pathname.startsWith("/app/cvs")
    ? 1
    : pathname.startsWith("/app/reports")
      ? 2
      : 0;
  return (
    <nav
      className={styles.nav}
      aria-label={t("app.header.nav")}
      data-tour="main-nav"
      style={{ "--nav-index": active } as React.CSSProperties}
    >
      <span className={styles.indicator} aria-hidden="true" />
      {[
        [t("app.header.chat"), "/app"],
        [t("app.header.cvs"), "/app/cvs"],
        [t("app.header.reports"), "/app/reports"],
      ].map(([name, href], index) => (
        <Link
          key={href}
          href={href}
          aria-current={active === index ? "page" : undefined}
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}
