"use client";

import LanguageSwitch from "@/components/landing/navbar/language-switch";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./drawer.module.css";

export default function DrawerAccountFooter({
  name,
  logOut,
}: {
  name: string;
  logOut: () => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.drawerFooter}>
      <span>{name}</span>
      <LanguageSwitch />
      <button type="button" onClick={logOut}>
        {t("app.drawer.logout")}
      </button>
    </div>
  );
}
