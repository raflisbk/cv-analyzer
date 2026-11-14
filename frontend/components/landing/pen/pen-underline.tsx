"use client";
import { usePenDraw } from "../motion/pen-draw";
import type { PenProps } from "./pen-types";
import styles from "./pen.module.css";

const paths = [
  "M2 52 Q14 29 27 52 T52 52 T77 52 T99 49",
  "M1 48 C20 55 37 41 58 49 S84 55 99 46",
  "M2 52 Q22 39 44 53 T98 48",
];
export default function PenUnderline({
  variant = 0,
  delay,
  play,
  label,
  onDark,
}: PenProps) {
  const ref = usePenDraw(play, delay);
  return (
    <svg
      ref={ref}
      className={`${styles.mark} ${styles.underline} ${onDark ? styles.light : ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      data-pen-mark="underline"
      aria-label={label}
    >
      <path d={paths[variant]} pathLength={1} />
    </svg>
  );
}
