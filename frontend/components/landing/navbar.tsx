"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import MobileMenu from "./navbar/mobile-menu";
import { NAV_LINKS } from "./navbar/nav-links";
import styles from "./navbar/navbar.module.css";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  return (
    <header className={styles.header} data-landing-nav>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/" className={styles.logo} aria-label="pathkr home">
          <Image
            src="/landing/logo/pathkr-lockup-on-red.svg"
            alt="pathkr"
            width={165}
            height={42}
            priority
          />
        </Link>
        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/workspace-v2/new" className={styles.action}>
          <span>{user ? "My workspace" : "Log in"}</span>
          <span className={styles.arrow}>
            <ArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>
        <MobileMenu />
      </nav>
    </header>
  );
}
