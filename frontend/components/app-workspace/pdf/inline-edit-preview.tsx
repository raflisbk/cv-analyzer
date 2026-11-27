import { useT } from "@/components/i18n/i18n-provider";

export interface RewritePreview {
  original: string;
  rewritten: string;
}

export function InlineEditPreview({
  preview,
  onApply,
  onClose,
}: {
  preview: RewritePreview;
  onApply: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="relative rounded-lg border border-[#ff5555]/35 bg-[var(--app-popover)] p-3">
          <div className="absolute -top-2.5 left-2 rounded border border-[#ff5555]/35 bg-[#ff5555] px-2 py-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-white">
              {t("appWorkspace.popover.before")}
            </p>
          </div>
          <p className="text-xs text-[var(--app-popover-ink)] line-clamp-4 mt-2 font-serif italic line-through decoration-[#ff5555]/50">
            {preview.original}
          </p>
        </div>

        <div className="relative rounded-lg border border-[#CAFF43]/35 bg-[var(--app-popover)] p-3">
          <div className="absolute -top-2.5 left-2 rounded border border-[#CAFF43]/35 bg-[#CAFF43] px-2 py-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--app-popover-ink)]">
              {t("appWorkspace.popover.after")}
            </p>
          </div>
          <p className="text-xs text-[var(--app-popover-ink)] line-clamp-4 mt-2 font-serif">
            {preview.rewritten}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 rounded-md border border-[var(--app-popover-line)] bg-[#CAFF43] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#141414] transition-colors hover:bg-[#b9ed35]"
        >
          {t("appWorkspace.popover.apply")}
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-md border border-[var(--app-popover-line)] bg-[var(--app-popover)] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[var(--app-popover-ink)] transition-colors hover:bg-[var(--app-popover-line)]"
        >
          {t("appWorkspace.popover.cancel")}
        </button>
      </div>
    </div>
  );
}
