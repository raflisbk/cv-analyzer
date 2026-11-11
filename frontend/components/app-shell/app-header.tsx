"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import AccountMenu from "@/components/landing/navbar/account-menu";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./app-shell.module.css";

export default function AppHeader({
  openDrawer,
  drawerOpen,
  newChat,
}: {
  openDrawer: () => void;
  drawerOpen: boolean;
  newChat: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const active = pathname.startsWith("/app/cvs")
    ? 1
    : pathname.startsWith("/app/reports")
      ? 2
      : 0;
  return (
    <header className={styles.header}>
      <button
        className={`${styles.pill} ${styles.snow} ${styles.round}`}
        type="button"
        aria-label="Chat history"
        aria-expanded={drawerOpen}
        onClick={openDrawer}
      >
        <Menu size={21} />
      </button>
      <Link
        href="/app"
        className={styles.logo}
        aria-label="pathkr, new chat"
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
      <nav
        className={styles.nav}
        aria-label="Main"
        data-tour="main-nav"
        style={{ "--nav-index": active } as React.CSSProperties}
      >
        <span className={styles.indicator} aria-hidden="true" />
        {[
          ["Chat", "/app"],
          ["My CVs", "/app/cvs"],
          ["Reports", "/app/reports"],
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
      <div className={styles.account} data-tour="account">
        {user && <AccountMenu user={user} app />}
      </div>
    </header>
  );
}
