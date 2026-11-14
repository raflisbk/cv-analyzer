import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import { ArrowRight } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import type { AuthUser } from "@/stores/auth-store";
import MobileAccountFooter from "./mobile-account-footer";
import styles from "./mobile-menu.module.css";

type Props = { user: AuthUser | null; onLogout: () => void };

export default function MobileMenuFooter({ user, onLogout }: Props) {
  const { t } = useT();
  return (
    <div className={styles.sheetBottom}>
      {user ? (
        <MobileAccountFooter user={user} onLogout={onLogout} />
      ) : (
        <SheetClose asChild>
          <Link href="/app" className={styles.mobileAction}>
            {t("account.mobileLogin")}{" "}
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </SheetClose>
      )}
    </div>
  );
}
