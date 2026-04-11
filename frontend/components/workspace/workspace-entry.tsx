import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { getResultsRoute } from "@/lib/job-routes";

interface WorkspaceEntryProps {
  jobId: string;
}

export function WorkspaceEntry({ jobId }: WorkspaceEntryProps) {
  return (
    <main className="min-h-screen bg-[#141414] text-[#F5F2D8]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(202,255,67,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit items-center rounded-full border border-[#CAFF43]/25 bg-[#CAFF43]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#CAFF43]">
                Pathkr workspace
              </span>
              <div className="space-y-3">
                <h1 className="font-display text-3xl font-extrabold md:text-5xl">
                  Your job-scoped workspace is ready.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-[#F5F2D8]/72 md:text-base">
                  Review the CV context for this analysis session and move
                  between the workspace and the full analysis view without
                  losing the originating job reference.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#F5F2D8]/72">
                Active job ID: <span className="font-mono text-[#F5F2D8]">{jobId}</span>
              </div>
              <Link
                href={getResultsRoute(jobId)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#CAFF43] px-5 py-3 text-sm font-extrabold text-[#141414] transition-colors hover:bg-[#CAFF43]/85"
              >
                View analysis results
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF4FCB]/15 text-[#FF4FCB]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold">Workspace rails</h2>
                <p className="text-sm text-[#F5F2D8]/60">Shared job context, preserved routes</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#F5F2D8]/72">
              <div className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-4">
                <p className="font-bold text-[#F5F2D8]">Analysis destination</p>
                <p className="mt-2 leading-6">
                  The existing results page remains available for the same job
                  whenever you want the full score breakdown.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-4">
                <p className="font-bold text-[#F5F2D8]">Workspace destination</p>
                <p className="mt-2 leading-6">
                  This route establishes the cockpit frame for the
                  document-focused workflow introduced in Phase 11.
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[1.75rem] border border-white/10 bg-[#191919] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CAFF43]/15 text-[#CAFF43]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold">Workspace canvas</h2>
                <p className="text-sm text-[#F5F2D8]/60">
                  A dedicated route shell for this uploaded CV and its linked analysis.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#CAFF43]">
                  Workspace scope
                </p>
                <p className="mt-3 text-sm leading-6 text-[#F5F2D8]/72">
                  The route is keyed directly from the originating{" "}
                  <span className="font-mono text-[#F5F2D8]">job_id</span>,
                  keeping workspace and results navigation aligned to the same
                  analysis record.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#FF8C42]">
                  Phase boundary
                </p>
                <p className="mt-3 text-sm leading-6 text-[#F5F2D8]/72">
                  Editing controls and formatting tools are intentionally
                  deferred so this plan can focus on route foundation and
                  navigation only.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <h2 className="font-display text-lg font-extrabold">Session checkpoints</h2>
            <div className="space-y-3 text-sm text-[#F5F2D8]/72">
              <div className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-4">
                <p className="font-bold text-[#F5F2D8]">1. Upload complete</p>
                <p className="mt-2 leading-6">The upload flow lands here automatically once analysis finishes.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-4">
                <p className="font-bold text-[#F5F2D8]">2. Review analysis</p>
                <p className="mt-2 leading-6">Jump to the existing results page at any time using the shared job-scoped link.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-4">
                <p className="font-bold text-[#F5F2D8]">3. Expand later phases</p>
                <p className="mt-2 leading-6">This shell is ready for richer document interactions without changing the route contract again.</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
