import { ReportPane } from "./panel/report-pane";
import { FixesPane } from "./panel/fixes-pane";
import { AtsPane } from "./panel/ats-pane";
import { JobMatchPane } from "./panel/job-match-pane";
import { GrammarPane } from "./panel/grammar-pane";
import { HistoryPane } from "./panel/history-pane";
import { ChatPane } from "./panel/chat-pane";
import type { WorkspacePanelProps } from "./workspace-panel";

export function PanelContent(props: WorkspacePanelProps) {
  if (props.tab === "report") {
    return (
      <ReportPane
        scores={props.scores}
        fixCount={props.fixes.length}
        bonus={props.bonus}
        openFixes={() => props.setTab("fixes")}
      />
    );
  }
  if (props.tab === "fixes") {
    return <FixesPane fixes={props.fixes} onApply={props.onApply} />;
  }
  if (props.tab === "ats") {
    return (
      <AtsPane
        data={props.ats}
        error={props.atsError}
        onExport={props.onExport}
      />
    );
  }
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
      />
    );
  }
  return (
    <ChatPane
      jobId={props.jobId}
      fileName={props.fileName}
      suggestedFix={props.fixes.find((fix) => !fix.after.includes("[")) ?? props.fixes[0]}
      onApply={(id) => {
        const fix = props.fixes.find((item) => item.id === id);
        if (fix && !/\[/.test(fix.after)) {
          props.onApply(fix, fix.after, document.body);
        }
      }}
      onShow={props.onShow}
    />
  );
}
