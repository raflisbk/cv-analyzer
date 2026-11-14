import { Settings } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "./account-menu.module.css";

export default function AccountSettingsRow() {
  const { t } = useT();
  return (
    <div
      className={`${styles.tile} ${styles.disabled}`}
      role="menuitem"
      aria-disabled="true"
      tabIndex={-1}
    >
      <span className={styles.icon}>
        <Settings size={22} strokeWidth={2.4} />
      </span>
      {t("account.settings")}{" "}
      <span className={styles.soon}>{t("account.soon")}</span>
    </div>
  );
}
