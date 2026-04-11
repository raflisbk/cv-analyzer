/**
 * Shimmer skeleton for results page loading state per UI-SPEC §7 B
 * Uses cream-tinted pulse (bg-[#141414]/8) per Mathical design system.
 */

export function ResultsSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-hidden="true" // per UI-SPEC §9 accessibility
    >
      {/* 2x2 gauge placeholder grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-xl bg-[#141414]/8 animate-pulse"
          />
        ))}
      </div>
      {/* Tab bar placeholder */}
      <div className="h-[48px] rounded-xl bg-[#141414]/8 animate-pulse" />
      {/* Content lines */}
      <div className="space-y-3">
        <div className="h-[20px] w-3/4 rounded bg-[#141414]/8 animate-pulse" />
        <div className="h-[20px] w-1/2 rounded bg-[#141414]/8 animate-pulse" />
        <div className="h-[20px] w-2/3 rounded bg-[#141414]/8 animate-pulse" />
      </div>
    </div>
  );
}
