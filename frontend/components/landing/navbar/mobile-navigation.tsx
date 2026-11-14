import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { MouseEvent } from "react";
import { SheetClose } from "@/components/ui/sheet";
import { NAV_LINKS } from "./nav-links";
import styles from "./mobile-menu.module.css";

type Props = {
  onNavigate: (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
    anchor: HTMLAnchorElement,
  ) => void;
};

export default function MobileNavigation({ onNavigate }: Props) {
  const { t } = useT();
  return (
    <nav aria-label={t("nav.mobile")} className={styles.mobileLinks}>
      {NAV_LINKS.map((link) => (
        <SheetClose key={link.href} asChild>
          <Link
            href={link.href}
            onClick={(event) =>
              onNavigate(event, link.href.slice(1), event.currentTarget)
            }
          >
            {t(link.key)}
          </Link>
        </SheetClose>
      ))}
      <SheetClose asChild>
        <Link href="/cv-analyzer">{t("nav.analyzer")}</Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/cv-builder">
          {t("nav.builder")} <small>{t("nav.comingSoon")}</small>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/job-finding">
          {t("nav.connect")} <small>{t("nav.comingSoon")}</small>
        </Link>
      </SheetClose>
    </nav>
  );
}
