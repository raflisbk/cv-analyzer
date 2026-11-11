import Image from "next/image";
import Link from "next/link";
import styles from "./app-shell.module.css";

export default function AppLogo({ newChat }: { newChat: () => void }) {
  return (
    <Link
      href="/app"
      className={styles.logo}
      aria-label="pathkr, new chat"
      onClick={newChat}
    >
      <Image
        src="/landing/logo/pathkr-lockup-on-red.svg"
        alt="pathkr"
        width={124}
        height={38}
        unoptimized
      />
    </Link>
  );
}
