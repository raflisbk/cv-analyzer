"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Settings2, X } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import LanguageToggle from "./language-toggle";
import ThemeToggle from "./theme-toggle";
import styles from "./dock.module.css";

export default function Dock() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const app = pathname.startsWith("/app");
  return (
    <aside
      className={styles.dock}
      data-dock
      data-app={app}
      data-open={open}
      aria-label={t("dock.label")}
    >
      <div className={styles.controls}>
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <button
        type="button"
        className={styles.fab}
        aria-expanded={open}
        aria-label={t(open ? "dock.close" : "dock.open")}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X size={22} aria-hidden="true" />
        ) : (
          <Settings2 size={22} aria-hidden="true" />
        )}
      </button>
    </aside>
  );
}
