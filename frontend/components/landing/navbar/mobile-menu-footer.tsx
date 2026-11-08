import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import styles from "./navbar.module.css";

type Props = { label: string | null; onLogout: () => void };

export default function MobileMenuFooter({ label, onLogout }: Props) {
  return (
    <div className={styles.sheetBottom}>
      {label && (
        <div className={styles.user}>
          <span>{label}</span>
          <button onClick={onLogout}>Log out</button>
        </div>
      )}
      <SheetClose asChild>
        <Link href="/workspace-v2/new" className={styles.mobileAction}>
          {label ? "My workspace" : "Log in to start"}
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </SheetClose>
    </div>
  );
}
