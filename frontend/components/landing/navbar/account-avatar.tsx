import Image from "next/image";
import { accountInitial, accountPhotoUrl } from "@/lib/account-menu";
import type { AuthUser } from "@/stores/auth-store";
import styles from "./account-menu.module.css";

export default function AccountAvatar({ user }: { user: AuthUser }) {
  const photo = accountPhotoUrl(user.picture);
  return (
    <span className={styles.picture} aria-hidden="true">
      {photo ? (
        <Image
          src={photo}
          alt=""
          fill
          unoptimized
          sizes="46px"
          className={styles.photo}
          referrerPolicy="no-referrer"
        />
      ) : (
        accountInitial(user)
      )}
    </span>
  );
}
