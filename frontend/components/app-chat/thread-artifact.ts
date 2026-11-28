import type { ThreadArtifact } from "./chat-thread";
import type { useChatArtifact } from "@/hooks/use-chat-artifact";

export function threadArtifact(
  jobId: string | null,
  state: ReturnType<typeof useChatArtifact>,
): ThreadArtifact | undefined {
  return jobId
    ? { jobId, cardIds: state.cardIds, open: state.open, show: state.show }
    : undefined;
}

export function panelProps(
  jobId: string | null,
  state: ReturnType<typeof useChatArtifact>,
) {
  return jobId ? { jobId, open: state.open, close: state.hide } : undefined;
}
