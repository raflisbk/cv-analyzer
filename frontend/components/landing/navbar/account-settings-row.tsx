import { Settings } from "lucide-react";
import styles from "./account-menu.module.css";

export default function AccountSettingsRow() {
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
      Settings <span className={styles.soon}>Soon</span>
    </div>
  );
}
