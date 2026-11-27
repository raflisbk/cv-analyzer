"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./dock-round.module.css";

export default function LoginButton() {
  const { t } = useT();
  return (
    <Link href="/app" className={styles.round} aria-label={t("nav.login")}>
      <Image
        src="/landing/3d/login-key.webp"
        alt=""
        width={36}
        height={36}
        className={styles.keyImage}
      />
    </Link>
  );
}
