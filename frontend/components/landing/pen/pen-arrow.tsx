"use client";
import { usePenDraw } from "../motion/pen-draw";
import type { PenProps } from "./pen-types";
import styles from "./pen.module.css";

const paths = [
  "M3 7 C29 12 32 30 86 34 L75 23 M86 34 L71 40",
  "M4 9 C36 -1 51 32 90 30 L78 18 M90 30 L75 40",
  "M2 4 C20 33 53 8 88 34 L74 27 M88 34 L76 42",
];
export default function PenArrow({
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
      className={`${styles.mark} ${styles.arrow} ${onDark ? styles.light : ""}`}
      viewBox="0 0 100 44"
      preserveAspectRatio="none"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      data-pen-mark="arrow"
      aria-label={label}
    >
      <path d={paths[variant]} pathLength={1} />
    </svg>
  );
}
