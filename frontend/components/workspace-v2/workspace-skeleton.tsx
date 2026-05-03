
export function WorkspaceSkeleton() {
  return (
    <div
      data-workspace-v2
      className="flex h-screen flex-col overflow-hidden bg-[#111111]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex h-12 flex-none items-center gap-3 border-b border-[rgba(255,255,255,0.13)] bg-[#111111] px-4">
        <div className="h-4 w-16 animate-pulse rounded bg-[#1A1A1A]" />
        <div className="h-4 w-px bg-[rgba(255,255,255,0.13)]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#1A1A1A]" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[290px] flex-none flex-col gap-3 border-r border-[rgba(255,255,255,0.07)] bg-[#1A1A1A] p-4 lg:flex">
          <div className="h-5 w-32 animate-pulse rounded bg-[#222222]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#222222]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#222222]" />
        </div>

        <div className="flex flex-1 items-center justify-center bg-[#111111] p-6">
          <div className="mx-auto w-full max-w-[860px] min-h-[400px] animate-pulse rounded-2xl bg-[#1A1A1A]" />
        </div>

        <div className="hidden w-[340px] flex-none flex-col gap-3 border-l border-[rgba(255,255,255,0.07)] bg-[#1A1A1A] p-4 lg:flex">
          <div className="h-5 w-24 animate-pulse rounded bg-[#222222]" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-[#222222]" />
          <div className="h-4 w-full animate-pulse rounded bg-[#222222]" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-[#222222]" />
        </div>
      </div>
    </div>
  );
}
