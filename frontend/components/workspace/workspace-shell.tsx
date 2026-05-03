import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import type { WorkspaceHydration } from "@/lib/workspace";
import { CanvasEditor } from "@/components/workspace/canvas/canvas-editor";

function getSuggestionCount(data: WorkspaceHydration): number {
  return (
    data.analysis.suggestions?.reduce(
      (count, card) => count + card.suggestions.length,
      0
    ) ?? 0
  );
}

function getSectionCount(data: WorkspaceHydration): number {
  return data.document.sections.length;
}

function getOverallScore(data: WorkspaceHydration): number {
  return data.analysis.scores?.overall ?? 0;
}

function getAtsScore(data: WorkspaceHydration): number {
  if (!data.analysis.ats_checks.length) {
    return 0;
  }

  const passedChecks = data.analysis.ats_checks.filter(
    (item) => item.status === "pass"
  ).length;
  return Math.round((passedChecks / data.analysis.ats_checks.length) * 100);
}

function getMatchScore(data: WorkspaceHydration): number {
  return data.analysis.comparison_result?.match_pct ?? 0;
}

function getGapLines(data: WorkspaceHydration): string[] {
  const missingSkills = data.analysis.comparison_result?.missing_skills ?? [];
  const atsWarnings = data.analysis.ats_checks
    .filter((item) => item.status !== "pass")
    .map((item) => item.check);
  const fallback = data.document.sections.length
    ? [
        `${data.document.sections.length} parsed sections are available in the editor canvas.`,
      ]
    : [
        "Workspace is still tied to this job while richer editing surfaces arrive in later phases.",
      ];

  return [
    ...missingSkills.slice(0, 2),
    ...atsWarnings.slice(0, 2),
    ...fallback,
  ].slice(0, 3);
}

function SummaryCard({
  label,
  value,
  helper,
  valueClassName,
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-[1.1rem] border border-[#141414]/10 bg-white/80 p-4">
      <p className="text-xs text-[#141414]/55">{label}</p>
      <strong className={`mt-1 block text-2xl ${valueClassName}`}>{value}</strong>
      <p className="mt-1 text-xs text-[#141414]/55">{helper}</p>
    </div>
  );
}

export function WorkspaceShell({ data }: { data: WorkspaceHydration }) {
  const suggestionCount = getSuggestionCount(data);
  const sectionCount = getSectionCount(data);
  const gapLines = getGapLines(data);

  return (
    <main className="min-h-screen bg-[#F5F2D8] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/60 bg-white/40 shadow-[0_20px_70px_rgba(20,20,20,0.08)] backdrop-blur">
        <div className="grid gap-6 border-b border-[#141414]/10 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#141414] font-display text-sm font-extrabold text-[#F5F2D8]">
              PK
            </div>
            <div className="space-y-2">
              <div>
                <h1 className="font-display text-xl font-extrabold text-[#141414] md:text-2xl">
                  Agentic CV Workspace
                </h1>
                <p className="text-sm text-[#141414]/58">
                  High-density cockpit for job-scoped review, routing, and hydration.
                </p>
              </div>
              <p className="text-xs text-[#141414]/50">
                Job ID: <span className="font-mono text-[#141414]">{data.job_id}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <SummaryCard
              label="Overall"
              value={String(getOverallScore(data))}
              helper="Workspace baseline"
              valueClassName="text-[#CAFF43]"
            />
            <SummaryCard
              label="ATS"
              value={String(getAtsScore(data))}
              helper="Formatting signals"
              valueClassName="text-[#FF8C42]"
            />
            <SummaryCard
              label="Job Match"
              value={String(getMatchScore(data))}
              helper={
                data.analysis.comparison_status === "complete"
                  ? "Comparison attached"
                  : "Comparison pending"
              }
              valueClassName="text-[#8B5CF6]"
            />
            <SummaryCard
              label="Open Edits"
              value={String(suggestionCount)}
              helper="AI suggestions visible"
              valueClassName="text-[#FF4FCB]"
            />
          </div>
        </div>

        <div className="grid min-h-[calc(100vh-220px)] gap-0 lg:grid-cols-[290px_minmax(0,1fr)_340px]">
          <aside className="space-y-4 border-b border-[#141414]/10 bg-white/25 p-4 lg:border-b-0 lg:border-r">
            <section className="rounded-[1.5rem] bg-[#141414] p-5 text-[#F5F2D8]">
              <h2 className="font-display text-base font-extrabold">Analysis matrix</h2>
              <p className="mt-1 text-xs text-[#F5F2D8]/60">
                Everything measurable stays visible while the editor surface loads.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  {
                    label: "Clarity",
                    value: data.analysis.scores?.clarity ?? 0,
                    color: "bg-[#CAFF43]",
                  },
                  {
                    label: "Impact",
                    value: data.analysis.scores?.impact ?? 0,
                    color: "bg-[#FF4FCB]",
                  },
                  {
                    label: "ATS",
                    value: getAtsScore(data),
                    color: "bg-[#FF8C42]",
                  },
                  {
                    label: "Role match",
                    value: getMatchScore(data),
                    color: "bg-[#8B5CF6]",
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#F5F2D8]/75">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
                      <div
                        className={`h-2.5 rounded-full ${item.color}`}
                        style={{ width: `${Math.max(0, Math.min(item.value, 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#141414]/10 bg-white/80 p-5">
              <h3 className="font-display text-sm font-extrabold text-[#141414]">
                Gap inventory
              </h3>
              <div className="mt-4 space-y-3">
                {gapLines.map((line) => (
                  <div
                    key={line}
                    className="rounded-[1rem] border border-[#141414]/6 bg-[#141414]/[0.04] p-4 text-sm leading-6 text-[#141414]/72"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#141414]/10 bg-white/80 p-5">
              <h3 className="font-display text-sm font-extrabold text-[#141414]">
                Document inventory
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-[#141414]/72">
                <div className="rounded-[1rem] bg-[#141414]/[0.04] p-4">
                  <strong className="block text-[#141414]">{sectionCount}</strong>
                  parsed sections available for the workspace surface
                </div>
                <div className="rounded-[1rem] bg-[#141414]/[0.04] p-4">
                  <strong className="block text-[#141414]">
                    {data.file.filename ?? "Untitled CV"}
                  </strong>
                  {data.file.mime_type ?? "Unknown file type"}
                </div>
              </div>
            </section>
          </aside>

          <CanvasEditor data={data} />

          <aside className="space-y-4 border-t border-[#141414]/10 bg-white/25 p-4 lg:border-l lg:border-t-0">
            <section className="rounded-[1.5rem] border border-[#141414]/10 bg-white/85 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#141414]/8 text-[#141414]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-extrabold text-[#141414]">
                    Agent command center
                  </h2>
                  <p className="text-xs text-[#141414]/55">
                    Read-only rationale surface for this job.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm leading-6">
                <div className="rounded-[1rem] border border-[#141414]/8 bg-white p-4">
                  <p className="text-[#141414]/72">
                    What are the top 3 changes needed to improve this CV?
                  </p>
                </div>
                <div className="rounded-[1rem] bg-[#141414]/[0.04] p-4 text-[#141414]/78">
                  Keep workspace and results tied to the same analysis
                  session, then layer richer document editing in the next
                  phase.
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[#141414]/10 bg-white/85 p-5">
              <h3 className="font-display text-sm font-extrabold text-[#141414]">
                Action queue
              </h3>
              <div className="mt-4 grid gap-3 text-sm">
                {[
                  {
                    label: "Workspace hydration",
                    state: data.status,
                    tone: "bg-[#CAFF43]/25 text-[#141414]",
                  },
                  {
                    label: "Section-aware editing",
                    state: "phase 12",
                    tone: "bg-[#FF8C42]/18 text-[#141414]/75",
                  },
                  {
                    label: "Agent apply/reject flows",
                    state: "phase 13",
                    tone: "bg-[#8B5CF6]/18 text-[#141414]/75",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#141414]/[0.04] px-4 py-3"
                  >
                    <span className="text-[#141414]/78">{item.label}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${item.tone}`}
                    >
                      {item.state}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-[#141414] p-5 text-[#F5F2D8]">
              <h3 className="font-display text-base font-extrabold">
                Why this direction
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#F5F2D8]/74">
                This route turns CV Analyzer into a career-intelligence
                cockpit while preserving the existing results page as a
                dedicated analytical view.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href={data.navigation.results_url}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#CAFF43] px-4 py-3 text-sm font-extrabold text-[#141414] transition-colors hover:bg-[#CAFF43]/85"
                >
                  View analysis results
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-4 py-3 text-sm font-extrabold text-[#F5F2D8] transition-colors hover:bg-white/8"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to homepage
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
