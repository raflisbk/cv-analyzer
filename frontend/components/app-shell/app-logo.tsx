"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./app-shell.module.css";

export default function AppLogo({ newChat }: { newChat: () => void }) {
  const { t } = useT();
  return (
    <Link
      href="/app"
      className={styles.logo}
      aria-label={t("app.header.logo")}
      onClick={newChat}
    >
      <Image
        src="/landing/logo/pathkr-lockup-on-red.svg"
        alt="pathkr"
        width={124}
        height={38}
        unoptimized
      />
    </Link>
  );
}
