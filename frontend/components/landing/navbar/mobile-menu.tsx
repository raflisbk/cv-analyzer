"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [open, setOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const onNavScroll = useNavScroll();
  async function logout() {
    await logoutApi();
    setUser(null);
    setOpen(false);
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={styles.menuButton}
          aria-label="Open navigation menu"
          aria-expanded={open}
        >
          <Menu aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className={mobileStyles.sheet}>
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className={mobileStyles.sheetTop}>
          <Image
            src="/landing/logo/pathkr-lockup-on-light.svg"
            alt="pathkr"
            width={140}
            height={38}
          />
          <SheetClose asChild>
            <button
              aria-label="Close menu"
              className={mobileStyles.closeButton}
            >
              <X aria-hidden="true" />
            </button>
          </SheetClose>
        </div>
        <MobileNavigation
          onNavigate={(event, sectionId, anchor) => {
            setOpen(false);
            onNavScroll(event, sectionId, anchor);
          }}
        />
        <MobileMenuFooter
          label={user?.name ?? user?.email ?? null}
          onLogout={logout}
        />
      </SheetContent>
    </Sheet>
  );
}
