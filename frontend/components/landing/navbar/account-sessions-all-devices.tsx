import { ShieldOff } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import type { useAccountMenu } from "@/hooks/use-account-menu";
import styles from "./account-menu.module.css";

type Menu = ReturnType<typeof useAccountMenu>;

export default function AccountSessionsAllDevices({ menu }: { menu: Menu }) {
  const { t } = useT();
  if (menu.confirmAll) {
    return (
      <div
        className={styles.tile}
        style={{
          gridColumn: "1 / 3",
          flexDirection: "row",
          alignItems: "center",
          opacity: 1,
          scale: 1,
          pointerEvents: "auto",
        }}
      >
        <span>{t("account.confirmAll")}</span>
        <button
          type="button"
          onClick={menu.logoutAll}
          aria-label={t("account.confirmAllLabel")}
        >
          {t("account.confirm")}
        </button>
        <button type="button" onClick={() => menu.setConfirmAll(false)}>
          {t("account.cancel")}
        </button>
      </div>
    );
  }
  return (
    <button
      ref={(node) => {
        menu.itemRefs.current[3] = node;
      }}
      type="button"
      role="menuitem"
      className={`${styles.tile} ${styles.logout}`}
      style={{
        gridColumn: "1 / 3",
        flexDirection: "row",
        alignItems: "center",
      }}
      onClick={() => menu.setConfirmAll(true)}
    >
      <ShieldOff size={22} aria-hidden="true" /> {t("account.logoutAll")}
    </button>
  );
}
