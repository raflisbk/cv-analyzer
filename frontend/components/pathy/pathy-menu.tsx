"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { usePathy } from "./pathy-context";
import styles from "./pathy.module.css";

export default function PathyMenu({ close }: { close: () => void }) {
  const pathy = usePathy();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useAppShellFocusTrap(true, ref, close);
  const start = (name: string) => {
    close();
    pathy.startTour(name);
  };
  return (
    <div ref={ref} className={styles.menu} role="menu" aria-label="Pathy help">
      <strong>Hi, I&apos;m Pathy</strong>
      <button role="menuitem" onClick={() => start("full")}>
        Take the 60-second tour
      </button>
      <button role="menuitem" onClick={() => start("export")}>
        How do I export?
      </button>
      <button role="menuitem" onClick={() => start("score")}>
        What does my score mean?
      </button>
      <button
        role="menuitem"
        onClick={() => {
          close();
          router.push("/app");
          requestAnimationFrame(() =>
            document
              .querySelector<HTMLInputElement>(
                "[data-tour='home-composer'] input",
              )
              ?.focus(),
          );
        }}
      >
        Ask me a question
      </button>
    </div>
  );
}
