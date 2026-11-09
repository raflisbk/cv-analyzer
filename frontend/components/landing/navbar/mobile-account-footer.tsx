import Link from "next/link";
import { LayoutGrid, LogOut, Settings } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { accountDisplayName } from "@/lib/account-menu";
import type { AuthUser } from "@/stores/auth-store";
import styles from "./mobile-menu.module.css";

export default function MobileAccountFooter({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  return (
    <>
      <div className={styles.userName}>{accountDisplayName(user)}</div>
      <SheetClose asChild>
        <Link href="/workspace-v2/new" className={styles.accountItem}>
          <LayoutGrid size={20} aria-hidden="true" /> Workspace
        </Link>
      </SheetClose>
      <div className={styles.accountItem} aria-disabled="true" tabIndex={-1}>
        <Settings size={20} aria-hidden="true" /> Settings
        <span className={styles.soon}>Soon</span>
      </div>
      <SheetClose asChild>
        <button
          type="button"
          className={`${styles.accountItem} ${styles.logout}`}
          onClick={onLogout}
        >
          <LogOut size={20} aria-hidden="true" /> Log out
        </button>
      </SheetClose>
    </>
  );
}
