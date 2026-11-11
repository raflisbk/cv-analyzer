import { ChatPane } from "./panel/chat-pane";
import type { WorkspacePanelProps } from "./workspace-panel";

export function PanelChatContent(props: WorkspacePanelProps) {
  return (
    <ChatPane
      jobId={props.jobId}
      fileName={props.fileName}
      suggestedFix={
        props.fixes.find((fix) => !fix.after.includes("[")) ?? props.fixes[0]
      }
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
