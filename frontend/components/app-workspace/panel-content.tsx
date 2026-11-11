import { ReportPane } from "./panel/report-pane";
import { FixesPane } from "./panel/fixes-pane";
import { AtsPane } from "./panel/ats-pane";
import { PanelAdvancedContent } from "./panel-advanced-content";
import type { WorkspacePanelProps } from "./workspace-panel";

export function PanelContent(props: WorkspacePanelProps) {
  if (props.tab === "report") {
    return (
      <ReportPane
        scores={props.scores}
        error={props.reportError}
        fixCount={props.fixes.length}
        bonus={props.bonus}
        openFixes={() => props.setTab("fixes")}
      />
    );
  }
  if (props.tab === "fixes") {
    return (
      <FixesPane
        fixes={props.fixes}
        error={props.fixesError}
        onApply={props.onApply}
      />
    );
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
  return <PanelAdvancedContent {...props} />;
}
