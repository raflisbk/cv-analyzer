"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { AuthUser } from "@/stores/auth-store";
import AccountAvatar from "./account-avatar";
import styles from "./nav-actions.module.css";

export default function NavAvatarLink({ user }: { user: AuthUser }) {
  const { t } = useT();
  return (
    <Link
      href="/app"
      className={styles.avatarLink}
      aria-label={t("account.workspace")}
    >
      <AccountAvatar user={user} />
    </Link>
  );
}
