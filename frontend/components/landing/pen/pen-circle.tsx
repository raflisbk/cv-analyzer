"use client";
import { usePenDraw } from "../motion/pen-draw";
import type { PenProps } from "./pen-types";
import styles from "./pen.module.css";

const paths = [
  "M91 41 C87 10 27 4 10 30 C-5 56 18 91 56 89 C95 87 109 61 91 41 Z",
  "M86 24 C53 0 10 13 7 49 C4 81 42 101 76 83 C108 65 105 39 86 24 Z",
  "M93 47 C89 18 44 2 18 22 C-5 42 9 83 39 89 C79 98 111 72 93 47 Z",
];
export default function PenCircle({
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
      className={`${styles.mark} ${styles.circle} ${onDark ? styles.light : ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      data-pen-mark="circle"
      aria-label={label}
    >
      <path d={paths[variant]} pathLength={1} />
    </svg>
  );
}
