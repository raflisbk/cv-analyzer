"use client";
import { useT } from "@/components/i18n/i18n-provider";
import Link from "next/link";
import { useLandingStory } from "@/hooks/use-landing-story";
import { footerMotion } from "@/components/landing/motion/footer";
import PlaneIcon from "../plane-icon";
import base from "../section.module.css";
import styles from "./footer.module.css";
import FooterColumns from "./footer-columns";
const footerScroll = { start: "top 92%", end: "bottom bottom" };

export default function FooterSection() {
  const { t } = useT();
  const ref = useLandingStory(footerMotion, 60, undefined, footerScroll);
  return (
    <footer ref={ref} id="footer" className={`${base.panel} ${styles.footer}`}>
      <div className={styles.top}>
        <div data-footer-column className={styles.brand}>
          <p>{t("landing.footer.body")}</p>
          <Link className={base.button} href="/app">
            {t("landing.footer.button")} <PlaneIcon size={52} />
          </Link>
        </div>
        <FooterColumns />
      </div>
      <div data-footer-bottom className={styles.bottom}>
        {t("landing.footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
