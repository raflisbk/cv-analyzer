"use client";
import type { ReactNode } from "react";
import PenArrow from "./pen-arrow";
import styles from "./pen.module.css";

type Props = {
  children: ReactNode;
  targetId: string;
  variant?: 0 | 1 | 2;
  delay?: number;
  play?: boolean;
  light?: boolean;
  arrow?: boolean;
};
export default function MarginNote({
  children,
  targetId,
  variant,
  delay,
  play,
  light,
  arrow = true,
}: Props) {
  return (
    <span
      className={`${styles.note} ${light ? styles.noteLight : ""}`}
      data-pen-note={targetId}
    >
      <span id={`${targetId}-note`}>{children}</span>
      {arrow && <PenArrow variant={variant} delay={delay} play={play} />}
    </span>
  );
}
