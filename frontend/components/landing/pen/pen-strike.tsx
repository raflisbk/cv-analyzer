"use client";
import { usePenDraw } from "../motion/pen-draw";
import type { PenProps } from "./pen-types";
import styles from "./pen.module.css";

const paths = [
  "M2 53 C27 46 52 57 98 48",
  "M2 47 C32 55 69 45 98 51",
  "M1 51 C24 56 47 44 72 50 S91 52 99 47",
];
export default function PenStrike({
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
      className={`${styles.mark} ${styles.strike} ${onDark ? styles.light : ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      data-pen-mark="strike"
      aria-label={label}
    >
      <path d={paths[variant]} pathLength={1} />
    </svg>
  );
}
