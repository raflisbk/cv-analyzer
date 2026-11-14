import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  return (
    <>
      <div className={styles.userName}>{accountDisplayName(user)}</div>
      <SheetClose asChild>
        <Link href="/app" className={styles.accountItem}>
          <LayoutGrid size={20} aria-hidden="true" /> {t("account.workspace")}
        </Link>
      </SheetClose>
      <div className={styles.accountItem} aria-disabled="true" tabIndex={-1}>
        <Settings size={20} aria-hidden="true" /> {t("account.settings")}
        <span className={styles.soon}>{t("account.soon")}</span>
      </div>
      <SheetClose asChild>
        <button
          type="button"
          className={`${styles.accountItem} ${styles.logout}`}
          onClick={onLogout}
        >
          <LogOut size={20} aria-hidden="true" /> {t("account.logout")}
        </button>
      </SheetClose>
    </>
  );
}
