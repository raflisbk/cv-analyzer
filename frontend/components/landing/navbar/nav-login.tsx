"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./nav-actions.module.css";

export default function NavLogin() {
  const { t } = useT();
  return (
    <Link href="/app" className={styles.login} aria-label={t("nav.login")}>
      <span className={styles.loginLabel} aria-hidden="true">
        {t("nav.login")}
      </span>
      <Image
        src="/landing/3d/login-key.webp"
        alt=""
        width={40}
        height={40}
        className={styles.key}
      />
    </Link>
  );
}
