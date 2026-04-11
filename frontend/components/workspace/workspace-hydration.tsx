"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";

import { useWorkspaceHydration } from "@/hooks/use-workspace-hydration";
import { getResultsRoute } from "@/lib/job-routes";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export function WorkspaceHydration({ jobId }: { jobId: string }) {
  const { data, error, isLoading, isError, refetch, isFetching } =
    useWorkspaceHydration(jobId);

  if (isLoading || !data) {
    return (
      <main className="min-h-screen bg-[#F5F2D8] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#141414]/10 bg-white/70 p-8 shadow-[0_20px_60px_rgba(20,20,20,0.08)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-[#141414] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F5F2D8]">
                Preparing workspace
              </span>
              <h1 className="font-display text-4xl font-extrabold text-[#141414]">
                Loading the cockpit for your CV session.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#141414]/62">
                We&apos;re hydrating the document context, score signals, and
                navigation state for this job before richer editing lands in
                later phases.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[#141414] p-6 text-[#F5F2D8]">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-[#CAFF43]" />
                <div>
                  <p className="font-display text-lg font-extrabold">
                    Preparing your workspace
                  </p>
                  <p className="text-sm text-[#F5F2D8]/60">
                    Job ID: <span className="font-mono">{jobId}</span>
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-3 rounded-full bg-[#CAFF43]/35" />
                <div className="h-3 rounded-full bg-white/12" />
                <div className="h-3 w-4/5 rounded-full bg-white/10" />
              </div>
              <div className="mt-6 rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-[#F5F2D8]/72">
                The route stays job-scoped while backend hydration decides
                whether the workspace is ready, still preparing, or failed.
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError || data.status === "failed") {
    return (
      <main className="min-h-screen bg-[#F5F2D8] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#FF4FCB]/18 bg-white/80 p-8 shadow-[0_20px_60px_rgba(20,20,20,0.08)]">
          <span className="inline-flex rounded-full bg-[#FF4FCB]/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FF4FCB]">
            Workspace failed
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-[#141414]">
            We couldn&apos;t prepare this workspace yet.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#141414]/68">
            {data.error || error?.message || "Workspace hydration failed for this job."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#141414] px-5 py-3 text-sm font-extrabold text-[#F5F2D8] transition-colors hover:bg-[#141414]/90"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry workspace
            </button>
            <Link
              href={data.navigation?.results_url ?? getResultsRoute(jobId)}
              className="inline-flex items-center justify-center rounded-full border border-[#141414]/15 bg-white px-5 py-3 text-sm font-extrabold text-[#141414] transition-colors hover:bg-[#141414] hover:text-[#F5F2D8]"
            >
              Open analysis results
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (data.status === "preparing") {
    return (
      <main className="min-h-screen bg-[#F5F2D8] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#141414]/10 bg-white/70 p-8 shadow-[0_20px_60px_rgba(20,20,20,0.08)]">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#141414]/45">
                Preparing your workspace
              </p>
              <h1 className="font-display text-4xl font-extrabold text-[#141414]">
                The cockpit is loading real CV context for this job.
              </h1>
            </div>
            <Link
              href={data.navigation.results_url}
              className="inline-flex items-center justify-center rounded-full border border-[#141414]/15 bg-white px-5 py-3 text-sm font-extrabold text-[#141414] transition-colors hover:bg-[#141414] hover:text-[#F5F2D8]"
            >
              View analysis results
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
            <section className="rounded-[1.5rem] bg-[#141414] p-5 text-[#F5F2D8]">
              <p className="font-display text-base font-extrabold">Analysis matrix</p>
              <div className="mt-4 space-y-3">
                <div className="h-3 rounded-full bg-[#CAFF43]/40" />
                <div className="h-3 rounded-full bg-[#FF4FCB]/25" />
                <div className="h-3 rounded-full bg-[#FF8C42]/25" />
              </div>
            </section>
            <section className="rounded-[1.5rem] border border-[#141414]/10 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#141414]/45">
                Document hydration
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-[#141414]">
                We already have the route; now we&apos;re waiting for the
                document payload to be fully ready.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#141414]/65">
                This state keeps the workspace destination stable even when
                backend parsing or analysis artifacts are still catching up.
              </p>
            </section>
            <section className="rounded-[1.5rem] border border-[#141414]/10 bg-white/85 p-5">
              <p className="font-display text-base font-extrabold text-[#141414]">
                Command center
              </p>
              <div className="mt-4 space-y-3">
                <div className="h-14 rounded-[1rem] bg-[#141414]/5" />
                <div className="h-14 rounded-[1rem] bg-[#141414]/5" />
                <div className="h-14 rounded-[1rem] bg-[#141414]/5" />
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return <WorkspaceShell data={data} />;
}
