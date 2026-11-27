"use client";

import { useT } from "@/components/i18n/i18n-provider";

export function AnnotationCardActions({
  accent,
  apply,
  dismiss,
}: {
  accent: string;
  apply: () => void;
  dismiss: () => void;
}) {
  const { t } = useT();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          apply();
        }}
        className="px-4 py-2 text-xs font-semibold rounded-md transition-all"
        style={{
          background: accent,
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          flex: 1,
          textAlign: "center",
        }}
      >
        {t("appWorkspace.pdf.apply")}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        className="px-4 py-2 text-xs font-semibold rounded-md transition-all"
        style={{
          background: "var(--app-popover-line)",
          color: "var(--app-popover-ink)",
          border: "1px solid var(--app-popover-line)",
          cursor: "pointer",
          flex: 1,
          textAlign: "center",
        }}
      >
        {t("appWorkspace.pdf.dismiss")}
      </button>
    </div>
  );
}
