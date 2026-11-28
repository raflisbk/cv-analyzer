"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./app-shell.module.css";
import chatStyles from "./app-shell-chat.module.css";

const LOGO = "/landing/logo/pathkr-lockup-on-";

function Lockup({ tone, className }: { tone: string; className?: string }) {
  return (
    <Image
      className={className}
      src={`${LOGO}${tone}.svg`}
      alt="pathkr"
      width={124}
      height={38}
      unoptimized
    />
  );
}

export default function AppLogo({
  newChat,
  chat = false,
}: {
  newChat: () => void;
  chat?: boolean;
}) {
  const { t } = useT();
  return (
    <Link
      href="/app"
      className={styles.logo}
      aria-label={t("app.header.logo")}
      onClick={newChat}
    >
      {chat ? (
        <>
          <Lockup tone="light" className={chatStyles.logoLight} />
          <Lockup tone="ink" className={chatStyles.logoInk} />
        </>
      ) : (
        <Lockup tone="red" />
      )}
    </Link>
  );
}
