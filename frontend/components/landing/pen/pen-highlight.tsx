"use client";
import { usePenDraw } from "../motion/pen-draw";
import type { PenProps } from "./pen-types";
import styles from "./pen.module.css";

const paths = [
  "M3 50 C31 48 63 53 97 49",
  "M2 53 C29 47 69 49 98 52",
  "M1 49 C25 53 56 47 99 50",
];
export default function PenHighlight({
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
      className={`${styles.mark} ${styles.highlight} ${onDark ? styles.darkHighlight : ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      data-pen-mark="highlight"
      aria-label={label}
    >
      <path d={paths[variant]} pathLength={1} />
    </svg>
  );
}
