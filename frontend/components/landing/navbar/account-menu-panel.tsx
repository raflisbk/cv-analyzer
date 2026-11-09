import { accountDisplayName } from "@/lib/account-menu";
import type { useAccountMenu } from "@/hooks/use-account-menu";
import type { AuthUser } from "@/stores/auth-store";
import AccountAvatar from "./account-avatar";
import AccountMenuItems from "./account-menu-items";
import styles from "./account-menu.module.css";

export default function AccountMenuPanel({
  user,
  menu,
}: {
  user: AuthUser;
  menu: ReturnType<typeof useAccountMenu>;
}) {
  return (
    <div
      className={styles.panel}
      role="menu"
      aria-label="Account"
      onKeyDown={menu.onMenuKeyDown}
    >
      <div className={styles.identity}>
        <AccountAvatar user={user} />
        <div className={styles.identityText}>
          <strong>{accountDisplayName(user)}</strong>
          <span>{user.email}</span>
        </div>
      </div>
      <AccountMenuItems menu={menu} />
    </div>
  );
}
