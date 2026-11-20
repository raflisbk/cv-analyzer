"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import type { WorkspaceTab } from "./workspace-panel";
import { nextTabIndex } from "@/lib/app-workspace/tabs";
import { PanelTabButton } from "./panel-tab-button";
import styles from "./workspace-styles";

const tabs: { key: WorkspaceTab }[] = [
  { key: "report" },
  { key: "fixes" },
  { key: "ats" },
  { key: "match" },
  { key: "grammar" },
  { key: "history" },
  { key: "chat" },
];

interface Props {
  tab: WorkspaceTab;
  setTab: (tab: WorkspaceTab) => void;
  fixCount: number;
  grammarCount: number;
}

function activateTabOnKey(
  event: React.KeyboardEvent<HTMLButtonElement>,
  index: number,
  row: RefObject<HTMLDivElement | null>,
  setTab: Props["setTab"],
) {
  const next = nextTabIndex(event.key, index, tabs.length);
  if (next === null) {
    return;
  }
  event.preventDefault();
  setTab(tabs[next].key);
  row.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
}

export function PanelTabs({ tab, setTab, fixCount, grammarCount }: Props) {
  const { t } = useT();
  const row = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 54 });
  useEffect(() => {
    const current = row.current?.querySelector<HTMLElement>(
      "[aria-selected=true]",
    );
    if (current) {
      setUnderline({ left: current.offsetLeft, width: current.offsetWidth });
      current.scrollIntoView?.({
        block: "nearest",
        inline: "nearest",
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "instant"
          : "smooth",
      });
    }
  }, [tab, fixCount, grammarCount]);
  return (
    <div
      ref={row}
      className={styles.tabs}
      role="tablist"
      aria-label={t("appWorkspace.tabs.label")}
      data-tour="workspace-panel-tabs"
    >
      {tabs.map(({ key }, index) => (
        <PanelTabButton
          key={key}
          value={key}
          label={t(`appWorkspace.tabs.${key}`)}
          selected={tab === key}
          fixCount={fixCount}
          grammarCount={grammarCount}
          onClick={() => setTab(key)}
          onKeyDown={(event) => activateTabOnKey(event, index, row, setTab)}
        />
      ))}
      <span className={styles.underline} style={underline} aria-hidden="true" />
    </div>
  );
}
