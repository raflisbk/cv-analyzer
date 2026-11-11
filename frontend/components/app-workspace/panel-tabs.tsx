"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkspaceTab } from "./workspace-panel";
import styles from "./workspace-styles";

const tabs: { key: WorkspaceTab; label: string }[] = [
  { key: "report", label: "Report" },
  { key: "fixes", label: "Fixes" },
  { key: "ats", label: "ATS" },
  { key: "match", label: "Job match" },
  { key: "grammar", label: "Grammar" },
  { key: "history", label: "History" },
  { key: "chat", label: "Chat" },
];

export function PanelTabs({
  tab,
  setTab,
  fixCount,
  grammarCount,
}: {
  tab: WorkspaceTab;
  setTab: (tab: WorkspaceTab) => void;
  fixCount: number;
  grammarCount: number;
}) {
  const row = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 54 });
  useEffect(() => {
    const current = row.current?.querySelector<HTMLElement>(
      "[aria-selected=true]",
    );
    if (current) {
      setUnderline({ left: current.offsetLeft, width: current.offsetWidth });
    }
  }, [tab, fixCount, grammarCount]);
  function onKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? tabs.length - 1
              : null;
    if (next === null) {
      return;
    }
    event.preventDefault();
    setTab(tabs[next].key);
    row.current
      ?.querySelectorAll<HTMLButtonElement>("[role=tab]")
      [next]?.focus();
  }
  return (
    <div
      ref={row}
      className={styles.tabs}
      role="tablist"
      aria-label="Workspace panel"
      data-tour="workspace-panel-tabs"
    >
      {tabs.map(({ key, label }, index) => (
        <button
          key={key}
          id={`tab-${key}`}
          className={styles.tab}
          type="button"
          role="tab"
          aria-controls={`pane-${key}`}
          aria-selected={tab === key}
          tabIndex={tab === key ? 0 : -1}
          onClick={() => setTab(key)}
          onKeyDown={(event) => onKey(event, index)}
        >
          {label}
          {key === "fixes" && <span className={styles.count}>{fixCount}</span>}
          {key === "grammar" && (
            <span className={styles.count}>{grammarCount}</span>
          )}
        </button>
      ))}
      <span className={styles.underline} style={underline} aria-hidden="true" />
    </div>
  );
}
