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
          background: "rgba(17,17,17,0.06)",
          color: "rgba(17,17,17,0.60)",
          border: "1px solid rgba(17,17,17,0.10)",
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
