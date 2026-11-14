"use client";

import { useRef } from "react";
import type { ScoreResult } from "@/lib/types";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import type { AtsData } from "@/lib/app-api/ats.types";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import type { VersionData } from "@/lib/app-api/history.types";
import { useAppWorkspaceScrollAssist } from "@/hooks/use-app-workspace-scroll-assist";
import { PanelTabs } from "./panel-tabs";
import { PanelContent } from "./panel-content";
import { ScrollMore } from "./scroll-more";
import styles from "./workspace-styles";

export type WorkspaceTab =
  | "report"
  | "fixes"
  | "ats"
  | "match"
  | "grammar"
  | "history"
  | "chat";
export interface WorkspacePanelProps {
  jobId: string;
  fileName: string;
  tab: WorkspaceTab;
  setTab: (tab: WorkspaceTab) => void;
  scores?: ScoreResult | null;
  reportError?: boolean;
  fixesError?: boolean;
  fixesLoading?: boolean;
  fixes: WorkspaceFix[];
  bonus: number;
  ats?: AtsData;
  atsError?: Error | null;
  grammar?: GrammarData;
  grammarError?: Error | null;
  versions?: VersionData[];
  historyError?: Error | null;
  resolvedGrammar: Set<string>;
  onApply: (
    fix: WorkspaceFix,
    text: string,
    anchor: HTMLElement,
    answers?: Record<string, string>,
  ) => boolean;
  onAddSkill: (skill: string) => boolean;
  onExport: () => void;
  onGrammar: (id: string, action: "accept" | "ignore") => Promise<void>;
  onShow: (anchorId: string, section?: string) => void;
  retryReport?: () => void;
  retryFixes?: () => void;
  retryAts?: () => void;
  retryGrammar?: () => void;
  retryHistory?: () => void;
}

export function WorkspacePanel(props: WorkspacePanelProps) {
  const body = useRef<HTMLDivElement>(null);
  const scroll = useAppWorkspaceScrollAssist(body, props.tab);
  const grammarCount = (props.grammar?.notes ?? []).filter(
    (note) => !props.resolvedGrammar.has(note.id),
  ).length;
  return (
    <aside className={styles.panel}>
      <PanelTabs
        tab={props.tab}
        setTab={props.setTab}
        fixCount={props.fixes.length}
        grammarCount={grammarCount}
      />
      <div
        className={styles.body}
        ref={body}
        role="tabpanel"
        id={`pane-${props.tab}`}
        aria-labelledby={`tab-${props.tab}`}
        tabIndex={0}
      >
        <PanelContent {...props} />
      </div>
      <ScrollMore visible={scroll.hasMore} onClick={scroll.scrollMore} />
    </aside>
  );
}
