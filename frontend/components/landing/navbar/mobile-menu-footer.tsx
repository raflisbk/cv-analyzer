import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import type { AuthUser } from "@/stores/auth-store";
import MobileAccountFooter from "./mobile-account-footer";
import styles from "./mobile-menu.module.css";

type Props = { user: AuthUser | null; onLogout: () => void };

export default function MobileMenuFooter({ user, onLogout }: Props) {
  return (
    <div className={styles.sheetBottom}>
      {user ? (
        <MobileAccountFooter user={user} onLogout={onLogout} />
      ) : (
        <SheetClose asChild>
          <Link href="/workspace-v2/new" className={styles.mobileAction}>
            Log in to start <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </SheetClose>
      )}
    </div>
  );
}
