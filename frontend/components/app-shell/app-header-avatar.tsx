"use client";

import { useT } from "@/components/i18n/i18n-provider";
import AccountAvatar from "@/components/landing/navbar/account-avatar";
import type { AuthUser } from "@/stores/auth-store";
import styles from "./app-shell.module.css";

export default function AppHeaderAvatar({
  user,
  onClick,
}: {
  user: AuthUser;
  onClick: () => void;
}) {
  const { t } = useT();
  return (
    <button
      type="button"
      className={styles.avatarButton}
      aria-label={t("account.menu")}
      onClick={onClick}
    >
      <AccountAvatar user={user} />
    </button>
  );
}
