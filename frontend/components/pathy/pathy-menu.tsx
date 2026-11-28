"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/i18n-provider";
import { useRef } from "react";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { usePathy } from "./pathy-context";
import styles from "./pathy.module.css";

export default function PathyMenu({ close }: { close: () => void }) {
  const pathy = usePathy();
  const router = useRouter();
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  useAppShellFocusTrap(true, ref, close);
  const start = (name: string) => {
    close();
    pathy.startTour(name);
  };
  return (
    <div
      ref={ref}
      className={styles.menu}
      role="menu"
      aria-label={t("pathy.ui.helperLabel")}
    >
      <strong>{t("pathy.ui.greeting")}</strong>
      <button role="menuitem" onClick={() => start("full")}>
        {t("pathy.ui.tourFull")}
      </button>
      <button role="menuitem" onClick={() => start("export")}>
        {t("pathy.ui.tourExport")}
      </button>
      <button role="menuitem" onClick={() => start("score")}>
        {t("pathy.ui.tourScore")}
      </button>
      <button
        role="menuitem"
        onClick={() => {
          close();
          router.push("/app");
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLInputElement>(
                "[data-tour='home-composer'] textarea",
              )
              ?.focus(),
          );
        }}
      >
        {t("pathy.ui.askQuestion")}
      </button>
    </div>
  );
}
