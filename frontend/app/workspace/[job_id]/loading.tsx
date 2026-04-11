function LoadingCard({
  title,
  valueClassName,
}: {
  title: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[#141414]/10 bg-white/70 p-4">
      <div className="h-3 w-20 rounded-full bg-[#141414]/10" />
      <div className="mt-3 h-3 w-12 rounded-full bg-[#141414]/8" aria-hidden="true" />
      <div className={`mt-4 h-7 rounded-full ${valueClassName}`} />
      <span className="sr-only">{title}</span>
      <div className="mt-3 h-3 w-24 rounded-full bg-[#141414]/8" />
    </div>
  );
}

export default function WorkspaceLoading() {
  return (
    <main className="min-h-screen bg-[#F5F2D8] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl animate-pulse rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_20px_70px_rgba(20,20,20,0.08)] backdrop-blur">
        <div className="grid gap-6 border-b border-[#141414]/10 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-[#141414]" />
              <div className="space-y-2">
                <div className="h-5 w-56 rounded-full bg-[#141414]/10" />
                <div className="h-3 w-72 rounded-full bg-[#141414]/8" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <LoadingCard title="Overall" valueClassName="bg-[#CAFF43]/40" />
            <LoadingCard title="ATS" valueClassName="bg-[#FF8C42]/35" />
            <LoadingCard title="Match" valueClassName="bg-[#8B5CF6]/30" />
            <LoadingCard title="Edits" valueClassName="bg-[#FF4FCB]/25" />
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-220px)] gap-0 lg:grid-cols-[290px_minmax(0,1fr)_340px]">
          <aside className="space-y-4 border-b border-[#141414]/10 bg-white/25 p-4 lg:border-b-0 lg:border-r">
            <div className="rounded-[1.5rem] bg-[#141414] p-5">
              <div className="h-4 w-28 rounded-full bg-white/20" />
              <div className="mt-3 space-y-3">
                <div className="h-3 rounded-full bg-[#CAFF43]/50" />
                <div className="h-3 rounded-full bg-[#FF4FCB]/35" />
                <div className="h-3 rounded-full bg-[#FF8C42]/35" />
                <div className="h-3 rounded-full bg-[#8B5CF6]/35" />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[#141414]/10 bg-white/70 p-5">
              <div className="h-4 w-24 rounded-full bg-[#141414]/10" />
              <div className="mt-4 space-y-3">
                <div className="h-14 rounded-[1rem] bg-[#141414]/6" />
                <div className="h-14 rounded-[1rem] bg-[#141414]/6" />
                <div className="h-14 rounded-[1rem] bg-[#141414]/6" />
              </div>
            </div>
          </aside>

          <section className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-full bg-[#141414]/8" />
                <div className="h-6 w-72 rounded-full bg-[#141414]/10" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-16 rounded-full bg-[#141414]/8" />
                <div className="h-9 w-16 rounded-full bg-[#141414]" />
                <div className="h-9 w-16 rounded-full bg-[#141414]/8" />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="rounded-[1.75rem] border border-[#141414]/10 bg-white p-6">
                <div className="mb-5 flex flex-wrap gap-2">
                  <div className="h-9 w-28 rounded-2xl bg-[#141414]/6" />
                  <div className="h-9 w-24 rounded-2xl bg-[#141414]/6" />
                  <div className="h-9 w-32 rounded-2xl bg-[#141414]/6" />
                </div>
                <div className="h-8 w-64 rounded-full bg-[#141414]/12" />
                <div className="mt-3 h-4 w-56 rounded-full bg-[#141414]/8" />
                <div className="mt-6 space-y-3">
                  <div className="h-20 rounded-[1rem] bg-[#FF4FCB]/12" />
                  <div className="h-20 rounded-[1rem] bg-[#CAFF43]/20" />
                  <div className="h-20 rounded-[1rem] bg-[#141414]/5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-28 rounded-[1.25rem] border border-[#141414]/10 bg-white/75" />
                <div className="h-28 rounded-[1.25rem] border border-[#141414]/10 bg-white/75" />
                <div className="h-24 rounded-[1.25rem] border border-[#141414]/10 bg-white/75" />
              </div>
            </div>
          </section>

          <aside className="space-y-4 border-t border-[#141414]/10 bg-white/25 p-4 lg:border-l lg:border-t-0">
            <div className="rounded-[1.5rem] border border-[#141414]/10 bg-white/75 p-5">
              <div className="h-4 w-36 rounded-full bg-[#141414]/10" />
              <div className="mt-4 space-y-3">
                <div className="h-16 rounded-[1rem] bg-[#141414]/5" />
                <div className="h-16 rounded-[1rem] bg-[#141414]/5" />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[#141414]/10 bg-white/75 p-5">
              <div className="h-4 w-24 rounded-full bg-[#141414]/10" />
              <div className="mt-4 space-y-3">
                <div className="h-14 rounded-[1rem] bg-[#141414]/5" />
                <div className="h-14 rounded-[1rem] bg-[#141414]/5" />
                <div className="h-14 rounded-[1rem] bg-[#141414]/5" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
