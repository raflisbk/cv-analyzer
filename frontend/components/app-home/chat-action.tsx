"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import type { ChatMessage } from "@/lib/app-api/conversations.types";

export default function ChatAction({
  action,
}: {
  action: NonNullable<ChatMessage["actions"]>[number];
}) {
  const { t } = useT();
  if (action.type === "open_workspace") {
    return (
      <Link href={`/app/cvs/${action.jobId}?view=${action.view}`}>
        {t("app.home.openWorkspace")}
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
        {t("app.home.showInEditor")}
      </button>
    );
  }
  return (
    <button type="button" data-fix-id={action.fixId}>
      {t("app.home.applyFix")}
    </button>
  );
}
