"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { pathyPoseSrc, type PathyPose } from "@/lib/pathy/pose";
import PathyMenu from "./pathy-menu";
import { usePathyHelper } from "@/hooks/use-pathy-helper";
import styles from "./pathy.module.css";

interface Props {
  pose: PathyPose;
  bubble: string;
}
const PathyHelper = forwardRef<HTMLButtonElement, Props>(function PathyHelper(
  { pose, bubble },
  ref,
) {
  const { open, idle, toggle, close } = usePathyHelper();
  return (
    <div className={styles.helper}>
      {bubble && !open && (
        <div className={styles.bubble} role="status">
          {bubble}
        </div>
      )}
      {open && <PathyMenu close={close} />}
      <button
        ref={ref}
        className={styles.helperButton}
        type="button"
        aria-label="Pathy help"
        aria-expanded={open}
        onClick={toggle}
      >
        <Image
          src={pathyPoseSrc(bubble ? pose : idle)}
          alt=""
          width={112}
          height={112}
          unoptimized
        />
      </button>
    </div>
  );
});
export default PathyHelper;
