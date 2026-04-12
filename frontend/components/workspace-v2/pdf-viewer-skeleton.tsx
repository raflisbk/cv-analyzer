/**
 * PdfViewerSkeleton — loading state untuk PDF viewer.
 * Shimmer bars animate-pulse dalam paper shape (cream bg, rounded, shadow).
 * (UI-SPEC Section 4 — Loading State)
 */
export function PdfViewerSkeleton() {
  return (
    <div className="flex flex-col items-center">
      {/* Paper skeleton — sama dimensi dengan real PDF paper */}
      <div
        className="
          mx-auto w-full max-w-[860px] min-h-[1080px]
          rounded-2xl bg-[#FFFDF4]
          border border-[rgba(202,255,67,0.08)]
          shadow-[0_8px_48px_rgba(0,0,0,0.65)]
          p-8
        "
        aria-busy="true"
        aria-live="polite"
      >
        {/* Name/title shimmer (40% width) */}
        <div className="mb-6 h-6 w-[40%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />

        {/* Body lines group 1 */}
        <div className="mb-2 h-4 w-[80%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-2 h-4 w-[65%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-2 h-4 w-[88%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-6 h-4 w-[32%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />

        {/* Body lines group 2 */}
        <div className="mb-2 h-4 w-[64%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-2 h-4 w-[88%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-2 h-4 w-[75%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-6 h-4 w-[50%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />

        {/* Body lines group 3 */}
        <div className="mb-2 h-4 w-[70%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-2 h-4 w-[88%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
        <div className="mb-2 h-4 w-[55%] rounded bg-[rgba(17,17,17,0.07)] animate-pulse" />
      </div>
      {/* Copy di bawah paper */}
      <p className="mt-4 text-center text-sm text-[rgba(245,242,216,0.65)]">
        Memuat dokumen...
      </p>
    </div>
  );
}
