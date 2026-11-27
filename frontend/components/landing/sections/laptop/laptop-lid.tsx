import type { ReactNode } from "react";
import styles from "./laptop-lid.module.css";

export default function LaptopLid({ children }: { children: ReactNode }) {
  return (
    <div className={styles.hinge}>
      <div className={styles.lid} data-laptop-lid>
        <div className={styles.front}>{children}</div>
        <div className={styles.back}>
          <img
            src="/landing/logo/pathkr-icon.svg"
            alt=""
            width={150}
            height={150}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
