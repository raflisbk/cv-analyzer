"use client";

import { useT } from "@/components/i18n/i18n-provider";
import Image from "next/image";
import lockup from "./navbar/pathkr-lockup-transparent.svg";
import lockupInk from "./navbar/pathkr-lockup-ink.svg";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useNavScroll } from "@/hooks/use-nav-scroll";
import MobileMenu from "./navbar/mobile-menu";
import AccountMenu from "./navbar/account-menu";
import NavAvatarLink from "./navbar/nav-avatar-link";
import NavCta from "./navbar/nav-cta";
import NavLogin from "./navbar/nav-login";
import { useNavBar } from "./navbar/use-nav-bar";
import { NAV_LINKS } from "./navbar/nav-links";
import styles from "./navbar/navbar.module.css";
import surface from "./navbar/nav-surface.module.css";

export default function Navbar() {
  const { t } = useT();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const onNavScroll = useNavScroll();
  const { spacerRef, headerRef, slotRef, ctaShown } = useNavBar();
  const account = isHydrated && user;
  return (
    <>
      <div ref={spacerRef} className={styles.spacer} aria-hidden="true" />
      <header
        ref={headerRef}
        className={`${styles.header} ${surface.surface}`}
        data-landing-nav
        data-tone="red"
        data-cta={ctaShown ? "shown" : "hidden"}
      >
        <nav className={styles.nav} aria-label={t("nav.main")}>
          <Link href="/" className={styles.logo} aria-label={t("nav.home")}>
            <Image
              src={lockup}
              alt="pathkr"
              width={165}
              height={42}
              className={surface.lockupLight}
              priority
            />
            <Image
              src={lockupInk}
              alt=""
              width={165}
              height={42}
              className={surface.lockupInk}
              aria-hidden="true"
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
            <div className={styles.lead}>
              {account ? <AccountMenu user={user} /> : <NavLogin />}
            </div>
            <NavCta slotRef={slotRef} shown={ctaShown} />
            {account && <NavAvatarLink user={user} />}
          </div>
          <MobileMenu />
        </nav>
      </header>
    </>
  );
}
