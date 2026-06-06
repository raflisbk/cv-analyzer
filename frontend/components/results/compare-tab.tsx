"use client";

import { useEffect, useRef, useState } from "react";
import { SSEConnection } from "@/lib/sse";
import type { ComparisonResult, JobRole, SkillGapItem } from "@/lib/types";

const PRIORITY_STYLES: Record<string, { badge: string; dot: string; label: string }> = {
  high: { badge: "bg-[#FF4FCB]/12 text-[#FF4FCB] border border-[#FF4FCB]/20", dot: "bg-[#FF4FCB]", label: "High Priority" },
  medium: { badge: "bg-[#FF8C42]/12 text-[#FF8C42] border border-[#FF8C42]/20", dot: "bg-[#FF8C42]", label: "Medium" },
  low: { badge: "bg-white/8 text-[#F5F2D8]/50 border border-white/10", dot: "bg-[#F5F2D8]/30", label: "Low" },
};

function SkillGapReport({ gaps }: { gaps: SkillGapItem[] }) {
  if (!gaps || gaps.length === 0) return null;
  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 md:p-8 space-y-4">
      <div>
        <h3 className="font-display font-extrabold text-base text-[#F5F2D8]">Skills Gap Report</h3>
        <p className="text-xs text-[#F5F2D8]/40 mt-1">Missing skills ranked by importance for this role</p>
      </div>
      <div className="space-y-3">
        {gaps.map((gap) => {
          const style = PRIORITY_STYLES[gap.priority] ?? PRIORITY_STYLES.low;
          return (
            <div key={gap.skill} className="rounded-xl border border-white/5 bg-[#141414] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                  <span className="font-extrabold text-sm text-[#F5F2D8] truncate">{gap.skill}</span>
                  <span className="text-xs text-[#F5F2D8]/30 flex-shrink-0">{gap.category}</span>
                </div>
                <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 flex-shrink-0 ${style.badge}`}>
                  {style.label}
                </span>
              </div>
              {gap.why_important && (
                <p className="text-xs text-[#F5F2D8]/50 leading-relaxed">{gap.why_important}</p>
              )}
              {gap.resources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gap.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#CAFF43]/70 hover:text-[#CAFF43] underline underline-offset-2 transition-colors"
                    >
                      {r.title} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CompareTabProps {
  jobId: string;
  jobRoles?: JobRole[];
  comparisonResult?: ComparisonResult | null;
  comparisonStatus?: string | null;
  onCompareComplete?: () => void;
  children?: React.ReactNode;
}

export function CompareTab({
  jobId,
  jobRoles = [],
  comparisonResult,
  comparisonStatus,
  onCompareComplete,
  children,
}: CompareTabProps) {
  const [jdText, setJdText] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryRequested, setRetryRequested] = useState(false);
  const [streamStage, setStreamStage] = useState<string | null>(null);
  const sseRef = useRef<SSEConnection | null>(null);

  useEffect(() => {
    return () => { sseRef.current?.close(); };
  }, []);

  const isLoading =
    streamStage === "comparing_job" ||
    comparisonStatus === "pending" ||
    comparisonStatus === "comparing";
  const isComplete = comparisonStatus === "complete" && comparisonResult !== null;
  const isFailed = !retryRequested && comparisonStatus === "failed";

  const canCompare = jdText.trim().length >= 50 && !isLoading && !isSubmitting;

  async function handleCompare() {
    if (!canCompare) { return; }
    setIsSubmitting(true);
    setError(null);
    setRetryRequested(false);
    try {
      const body: { jd_text: string; jd_role_id?: string } = { jd_text: jdText };
      if (selectedRoleId) { body.jd_role_id = selectedRoleId; }
      const response = await fetch(`/api/v1/jobs/${jobId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) { throw new Error("Comparison request failed"); }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const connection = new SSEConnection(
        `${apiUrl}/stream/${jobId}`,
        (data) => {
          if (data.stage) {
            setStreamStage(data.stage);
            if (data.stage === "complete" || data.stage === "failed") {
              connection.close();
              sseRef.current = null;
              setStreamStage(null);
              onCompareComplete?.();
            }
          }
        },
        () => {
          setStreamStage(null);
          onCompareComplete?.();
        }
      );
      connection.connect();
      sseRef.current = connection;
    } catch {
      setError("We couldn't compare your CV right now. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isFailed || error) {
    return (
      <div className="bg-[#1C1C1C] rounded-2xl border border-[#FF4FCB]/20 p-6 md:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FF4FCB]/10 border border-[#FF4FCB]/20 flex items-center justify-center mx-auto">
          <span className="text-[#FF4FCB] font-extrabold text-lg">✕</span>
        </div>
        <div>
          <p className="font-display font-extrabold text-lg text-[#FF4FCB] mb-2">Comparison failed</p>
          <p className="text-sm text-[#F5F2D8]/60">
            {error ?? "We couldn't compare your CV right now. Check your connection and try again."}
          </p>
        </div>
        <button
          className="rounded-full border border-white/10 text-[#F5F2D8]/70 text-sm font-bold px-6 py-2.5 hover:bg-white/5 transition-colors"
          onClick={() => { setError(null); setIsSubmitting(false); setRetryRequested(true); }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#CAFF43] rounded-full animate-ping" />
          <p className="text-sm font-bold text-[#F5F2D8]/60">Comparing your CV against the job description…</p>
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-white/5 rounded-full animate-pulse w-24" />
          <div className="h-4 bg-white/5 rounded-full animate-pulse w-36" />
          <div className="h-2 bg-white/5 rounded-full animate-pulse" />
          <div className="h-2 bg-white/5 rounded-full animate-pulse w-4/5" />
          <div className="h-2 bg-white/5 rounded-full animate-pulse w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 md:p-8">
        {jobRoles.length > 0 && (
          <div className="mb-5">
            <label className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2D8]/40 block mb-2">
              Or pick a saved job
            </label>
            <div className="relative">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F2D8] focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/30 appearance-none cursor-pointer"
              >
                <option value="">Select a role…</option>
                {jobRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.seniority}) — {role.industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2D8]/40 block mb-2">
            Job Description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here…"
            className="w-full min-h-[160px] resize-y bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F2D8] placeholder-[#F5F2D8]/30 focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/30 focus:border-[#CAFF43]/40 transition-colors"
            aria-label="Job Description"
          />
          <p className={`text-xs mt-1.5 text-right ${jdText.trim().length >= 50 ? "text-[#CAFF43]/60" : "text-[#F5F2D8]/30"}`}>
            {jdText.length} chars {jdText.trim().length < 50 ? `(${50 - jdText.trim().length} more to enable)` : "✓"}
          </p>
        </div>

        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className="w-full rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold py-3.5 hover:bg-[#CAFF43]/85 active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Starting comparison…" : "Compare CV →"}
        </button>
      </div>

      {isComplete && children}
      {isComplete && comparisonResult?.skill_gaps && comparisonResult.skill_gaps.length > 0 && (
        <SkillGapReport gaps={comparisonResult.skill_gaps} />
      )}

      {!isComplete && !isLoading && (
        <div className="text-center py-10 space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#CAFF43]/8 border border-[#CAFF43]/15 flex items-center justify-center mx-auto">
            <span className="text-[#CAFF43] text-xl">⇄</span>
          </div>
          <p className="font-display font-extrabold text-lg text-[#141414]">Compare your CV to a job</p>
          <p className="text-sm text-[#141414]/50 max-w-sm mx-auto">
            Paste a job description above to see how well your CV matches —
            including skills gaps, missing qualifications, and a match score.
          </p>
        </div>
      )}
    </div>
  );
}
