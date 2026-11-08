import Link from "next/link";
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
  return (
    <nav aria-label="Mobile navigation" className={styles.mobileLinks}>
      {NAV_LINKS.map((link) => (
        <SheetClose key={link.href} asChild>
          <Link
            href={link.href}
            onClick={(event) =>
              onNavigate(event, link.href.slice(1), event.currentTarget)
            }
          >
            {link.label}
          </Link>
        </SheetClose>
      ))}
      <SheetClose asChild>
        <Link href="/cv-analyzer">CV Analyzer</Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/cv-builder">
          CV Builder <small>Coming soon</small>
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/job-finding">
          Job Connect <small>Coming soon</small>
        </Link>
      </SheetClose>
    </nav>
  );
}
