import { ShieldOff } from "lucide-react";
import type { useAccountMenu } from "@/hooks/use-account-menu";
import styles from "./account-menu.module.css";

type Menu = ReturnType<typeof useAccountMenu>;

export default function AccountSessionsAllDevices({ menu }: { menu: Menu }) {
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
        <span>Sign out everywhere?</span>
        <button
          type="button"
          onClick={menu.logoutAll}
          aria-label="Confirm log out of all devices"
        >
          Yes
        </button>
        <button type="button" onClick={() => menu.setConfirmAll(false)}>
          Cancel
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
      <ShieldOff size={22} aria-hidden="true" /> Log out of all devices
    </button>
  );
}
