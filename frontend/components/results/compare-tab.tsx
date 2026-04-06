"use client";

/**
 * CompareTab — CV vs Job Description comparison input + results display.
 * States: idle (textarea + CTA) | loading (skeleton) | complete (children) | error
 * Per UI-SPEC §7.1, D-C17, D-C20, UX-04, UX-05.
 */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SSEConnection } from "@/lib/sse";
import type { ComparisonResult, JobRole } from "@/lib/types";

interface CompareTabProps {
  jobId: string;
  jobRoles?: JobRole[];
  comparisonResult?: ComparisonResult | null;
  comparisonStatus?: string | null;
  /** Called when SSE emits complete/failed — triggers parent refetch per STREAM-04 */
  onCompareComplete?: () => void;
  /** Render slots — filled with SkillsGapDisplay etc. in 04-05/04-06 */
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
  /** Local SSE stage — drives loading state in real-time per STREAM-04 */
  const [streamStage, setStreamStage] = useState<string | null>(null);
  const sseRef = useRef<SSEConnection | null>(null);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      sseRef.current?.close();
    };
  }, []);

  const isLoading =
    streamStage === "comparing_job" ||
    comparisonStatus === "pending" ||
    comparisonStatus === "comparing";
  const isComplete = comparisonStatus === "complete" && comparisonResult !== null;
  const isFailed = comparisonStatus === "failed";

  /** "Compare CV" button disabled when textarea < 50 chars per UI-SPEC §7.1 */
  const canCompare = jdText.trim().length >= 50 && !isLoading && !isSubmitting;

  async function handleCompare() {
    if (!canCompare) { return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const body: { jd_text: string; jd_role_id?: string } = {
        jd_text: jdText,
      };
      if (selectedRoleId) {
        body.jd_role_id = selectedRoleId;
      }
      const response = await fetch(`/api/v1/jobs/${jobId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error("Comparison request failed");
      }

      // Open fresh SSE connection to stream comparison progress per STREAM-04
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
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
          // SSE error — fall back to parent polling
          setStreamStage(null);
          onCompareComplete?.();
        }
      );
      connection.connect();
      sseRef.current = connection;
    } catch {
      setError(
        "We couldn't compare your CV right now. Check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (isFailed || error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-xl font-bold text-destructive mb-2">
            Comparison failed
          </p>
          <p className="text-base font-medium text-muted-foreground">
            {error ??
              "We couldn't compare your CV right now. Check your connection and try again."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setError(null);
              setIsSubmitting(false);
            }}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground text-center mt-4 mb-6">
            Comparing your CV against the job description…
          </p>
          {/* ComparisonSkeleton placeholder — replaced by full component in 04-05 */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Input form (idle state) ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Input card — always visible per UI-SPEC §7.1, D-C17 */}
      <Card>
        <CardContent className="p-6">
          {/* Job selector dropdown — only shown when saved job roles are available */}
          {jobRoles.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">
                Or pick a saved job
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => {
                  const roleId = e.target.value;
                  setSelectedRoleId(roleId);
                }}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">Select a role…</option>
                {jobRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.seniority}) — {role.industry}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Job description textarea per UI-SPEC §7.1 */}
          <label className="text-sm font-medium block mb-2">
            Job Description
          </label>
          <Textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here…"
            className="min-h-[160px] resize-y mb-4"
            aria-label="Job Description"
          />

          {/* Compare CTA — full width, disabled when < 50 chars per UI-SPEC §7.1 */}
          <Button
            onClick={handleCompare}
            disabled={!canCompare}
            className="w-full"
            variant="default"
          >
            {isSubmitting ? "Starting comparison…" : "Compare CV"}
          </Button>
        </CardContent>
      </Card>

      {/* Results section — populated when complete; uses render slot */}
      {isComplete && children}

      {/* Empty state — shown before first comparison is triggered */}
      {!isComplete && !isLoading && (
        <div className="text-center py-8">
          <p className="text-xl font-bold mb-2">Compare your CV to a job</p>
          <p className="text-base font-medium text-muted-foreground">
            Paste a job description above to see how well your CV matches —
            including skills gaps, missing qualifications, and a match score.
          </p>
        </div>
      )}
    </div>
  );
}
