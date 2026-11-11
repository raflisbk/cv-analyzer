"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { HELP, type HelpKey } from "@/lib/pathy/help-content";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { usePathy } from "./pathy-context";
import styles from "./help.module.css";

export interface HelpButtonProps {
  helpKey: string;
  label?: string;
}

export default function HelpButton({ helpKey, label }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathy = usePathy();
  const content = HELP[helpKey as HelpKey];
  if (!content) {
    throw new Error(`Unknown Pathy help key: ${helpKey}`);
  }
  useAppShellFocusTrap(open, ref, () => setOpen(false));
  return (
    <span className={styles.helpWrap}>
      <button
        className={styles.helpButton}
        type="button"
        data-help-key={helpKey}
        aria-label={label ?? `Help: ${content?.title ?? helpKey}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ?
      </button>
      {open && content && (
        <span
          ref={ref}
          className={styles.helpCard}
          role="dialog"
          aria-label={content.title}
        >
          <Image
            src={pathyPoseSrc(content.pose)}
            alt=""
            width={64}
            height={64}
            unoptimized
          />
          <strong>{content.title}</strong>
          <span>{content.text}</span>
          <span className={styles.helpActions}>
            <button onClick={() => setOpen(false)}>Got it</button>
            <button
              onClick={() => {
                setOpen(false);
                pathy.startTour("full");
              }}
            >
              Show me the tour
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
