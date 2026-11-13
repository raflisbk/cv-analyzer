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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div className="relative rounded-lg border border-[#ff5555]/35 bg-white p-3">
          <div className="absolute -top-2.5 left-2 rounded border border-[#ff5555]/35 bg-[#ff5555] px-2 py-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-white">
              Before
            </p>
          </div>
          <p className="text-xs text-[#111111] line-clamp-4 mt-2 font-serif italic line-through decoration-[#ff5555]/50">
            {preview.original}
          </p>
        </div>

        <div className="relative rounded-lg border border-[#CAFF43]/35 bg-white p-3">
          <div className="absolute -top-2.5 left-2 rounded border border-[#CAFF43]/35 bg-[#CAFF43] px-2 py-0.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#111111]">
              After
            </p>
          </div>
          <p className="text-xs text-[#111111] line-clamp-4 mt-2 font-serif">
            {preview.rewritten}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 rounded-md border border-[#111111]/15 bg-[#CAFF43] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#b9ed35]"
        >
          Apply
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-md border border-[#111111]/15 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#F5F2D8]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
