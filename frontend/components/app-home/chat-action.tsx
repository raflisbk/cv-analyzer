import Link from "next/link";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

export default function ChatAction({
  action,
}: {
  action: NonNullable<ChatMessage["actions"]>[number];
}) {
  if (action.type === "open_workspace") {
    return (
      <Link href={`/app/cvs/${action.jobId}?view=${action.view}`}>
        Open workspace
      </Link>
    );
  }
  if (action.type === "show_in_editor") {
    return (
      <button
        type="button"
        onClick={() =>
          document
            .querySelector(`[data-anchor-id='${CSS.escape(action.anchorId)}']`)
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        Show in editor
      </button>
    );
  }
  return (
    <button type="button" data-fix-id={action.fixId}>
      Apply fix
    </button>
  );
}
