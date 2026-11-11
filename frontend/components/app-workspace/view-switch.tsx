"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkspaceView } from "./workspace-header";
import styles from "./workspace-styles";

interface Props {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
}

export function ViewSwitch({ view, setView }: Props) {
  const switchRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 4, width: 80 });
  useEffect(() => {
    const selected = switchRef.current?.querySelector<HTMLButtonElement>(
      "[aria-pressed=true]",
    );
    if (selected) {
      setIndicator({ left: selected.offsetLeft, width: selected.offsetWidth });
    }
  }, [view]);
  return (
    <div
      className={styles.switch}
      ref={switchRef}
      data-tour="workspace-view-switch"
      role="group"
      aria-label="Document view"
    >
      <span className={styles.indicator} style={indicator} aria-hidden="true" />
      {(["editor", "pdf", "report"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={view === item}
          onClick={() => setView(item)}
        >
          {item === "report"
            ? "Full report"
            : item === "pdf"
              ? "PDF"
              : "Editor"}
        </button>
      ))}
    </div>
  );
}
