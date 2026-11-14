"use client";

import { useT } from "@/components/i18n/i18n-provider";
import LanguageSwitch from "./navbar/language-switch";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useNavScroll } from "@/hooks/use-nav-scroll";
import MobileMenu from "./navbar/mobile-menu";
import AccountMenu from "./navbar/account-menu";
import { NAV_LINKS } from "./navbar/nav-links";
import styles from "./navbar/navbar.module.css";

export default function Navbar() {
  const { t } = useT();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const onNavScroll = useNavScroll();
  return (
    <header className={styles.header} data-landing-nav>
      <nav className={styles.nav} aria-label={t("nav.main")}>
        <Link href="/" className={styles.logo} aria-label={t("nav.home")}>
          <Image
            src="/landing/logo/pathkr-lockup-on-red.svg"
            alt="pathkr"
            width={165}
            height={42}
            priority
          />
          <span className={styles.logoNote} aria-hidden="true">
            path karir
          </span>
        </Link>
        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) =>
                onNavScroll(event, link.href.slice(1), event.currentTarget)
              }
            >
              {t(link.key)}
            </Link>
          ))}
        </div>
        <div className={styles.actions}>
          <LanguageSwitch />
          {isHydrated && user ? (
            <AccountMenu user={user} />
          ) : (
            <Link href="/app" className={styles.action}>
              <span>{t("nav.login")}</span>
              <span className={styles.keyWrap} aria-hidden="true">
                <Image
                  src="/landing/3d/login-key.webp"
                  alt=""
                  width={50}
                  height={50}
                  className={styles.key}
                />
              </span>
            </Link>
          )}
        </div>
        <MobileMenu />
      </nav>
    </header>
  );
}
