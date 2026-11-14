"use client";

import { useT } from "@/components/i18n/i18n-provider";
import LanguageSwitch from "./language-switch";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { logoutApi } from "@/lib/auth";
import { useNavScroll } from "@/hooks/use-nav-scroll";
import MobileNavigation from "./mobile-navigation";
import MobileMenuFooter from "./mobile-menu-footer";
import styles from "./navbar.module.css";
import mobileStyles from "./mobile-menu.module.css";

export default function MobileMenu() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();
  const onNavScroll = useNavScroll();
  async function logout() {
    try {
      await logoutApi();
    } catch {
    } finally {
      setUser(null);
      setOpen(false);
      router.push("/");
    }
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={styles.menuButton}
          aria-label={t("nav.openMenu")}
          aria-expanded={open}
        >
          <Menu aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className={mobileStyles.sheet}>
        <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
        <div className={mobileStyles.sheetTop}>
          <Image
            src="/landing/logo/pathkr-lockup-on-light.svg"
            alt="pathkr"
            width={140}
            height={38}
          />
          <SheetClose asChild>
            <button
              aria-label={t("nav.closeMenu")}
              className={mobileStyles.closeButton}
            >
              <X aria-hidden="true" />
            </button>
          </SheetClose>
        </div>
        <div className="px-5 pt-4">
          <LanguageSwitch />
        </div>
        <MobileNavigation
          onNavigate={(event, sectionId, anchor) => {
            setOpen(false);
            onNavScroll(event, sectionId, anchor);
          }}
        />
        <MobileMenuFooter user={isHydrated ? user : null} onLogout={logout} />
      </SheetContent>
    </Sheet>
  );
}
