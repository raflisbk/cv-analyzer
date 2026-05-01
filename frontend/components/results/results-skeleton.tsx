

export function ResultsSkeleton() {
  return (
    <div
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-xl bg-[#141414]/8 animate-pulse"
          />
        ))}
      </div>
      <div className="h-[48px] rounded-xl bg-[#141414]/8 animate-pulse" />
      <div className="space-y-3">
        <div className="h-[20px] w-3/4 rounded bg-[#141414]/8 animate-pulse" />
        <div className="h-[20px] w-1/2 rounded bg-[#141414]/8 animate-pulse" />
        <div className="h-[20px] w-2/3 rounded bg-[#141414]/8 animate-pulse" />
      </div>
    </div>
  );
}
