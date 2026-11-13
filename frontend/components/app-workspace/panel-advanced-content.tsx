import { JobMatchPane } from "./panel/job-match-pane";
import { GrammarPane } from "./panel/grammar-pane";
import { HistoryPane } from "./panel/history-pane";
import { PanelChatContent } from "./panel-chat-content";
import type { WorkspacePanelProps } from "./workspace-panel";

export function PanelAdvancedContent(props: WorkspacePanelProps) {
  if (props.tab === "match") {
    return (
      <JobMatchPane
        jobId={props.jobId}
        onAdd={props.onAddSkill}
        openFixes={() => props.setTab("fixes")}
      />
    );
  }
  if (props.tab === "grammar") {
    return (
      <GrammarPane
        data={props.grammar}
        error={props.grammarError}
        retry={props.retryGrammar}
        resolved={props.resolvedGrammar}
        onResolve={props.onGrammar}
      />
    );
  }
  if (props.tab === "history") {
    return (
      <HistoryPane
        jobId={props.jobId}
        versions={props.versions}
        error={props.historyError}
        retry={props.retryHistory}
      />
    );
  }
  return <PanelChatContent {...props} />;
}
