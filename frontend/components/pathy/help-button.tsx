"use client";

import { useRef, useState } from "react";
import { HELP, type HelpKey } from "@/lib/pathy/help-content";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { usePathy } from "./pathy-context";
import HelpCard from "./help-card";
import styles from "./help.module.css";

export interface HelpButtonProps {
  helpKey: string;
  label?: string;
}

export default function HelpButton({ helpKey, label }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
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
      {open && (
        <HelpCard
          innerRef={ref}
          content={content}
          close={() => setOpen(false)}
          tour={() => {
            setOpen(false);
            pathy.startTour("full");
          }}
        />
      )}
    </span>
  );
}
