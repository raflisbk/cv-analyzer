"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
import { getWorkspaceRoute } from "@/lib/job-routes";
import { toast } from "sonner";
import Link from "next/link";
import { PathkrLogo } from "@/components/ui/pathkr-logo";

type UploadState = "idle" | "preview" | "processing" | "complete" | "failed";

export function UploadWorkspaceContent() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const hasNavigatedRef = useRef(false);

  const uploadMutation = useUpload();

  const { progress, isConnected, error: streamError } = useJobStream(jobId, {
    onComplete: (id) => {
      setCompletedJobId(id);
    },
  });

  const isProcessing = jobId !== null && completedJobId === null;

  // Determine state
  let state: UploadState = "idle";
  if (progress?.stage === "failed") {
    state = "failed";
  } else if (completedJobId) {
    state = "complete";
  } else if (isProcessing) {
    state = "processing";
  } else if (selectedFile) {
    state = "preview";
  }

  // Navigate to workspace on completion
  useEffect(() => {
    if (!completedJobId || hasNavigatedRef.current) { return; }
    hasNavigatedRef.current = true;
    router.push(getWorkspaceRoute(completedJobId));
  }, [completedJobId, router]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) { return; }
    try {
      const result = await uploadMutation.mutateAsync(selectedFile);
      setJobId(result.job_id);
      toast.success("Upload successful!", {
        description: "Your CV is being analyzed...",
        duration: 3000,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobId(null);
    setCompletedJobId(null);
    hasNavigatedRef.current = false;
    uploadMutation.reset();
  };

  return (
    <div
      className="flex h-screen flex-col overflow-hidden text-[--ws-ink]"
      style={{
        background: [
          "radial-gradient(circle at top left, rgba(202,255,67,0.15) 0%, transparent 22%)",
          "radial-gradient(circle at top right, rgba(246,122,223,0.09) 0%, transparent 22%)",
          "radial-gradient(circle at bottom left, rgba(255,140,66,0.07) 0%, transparent 18%)",
          "#F5F2D8",
        ].join(", "),
      }}
    >
      {/* Dot grid decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(17,17,17,0.11) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Frosted glass floating panels */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          style={{
            position: "absolute", top: "-80px", left: "-60px",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(202,255,67,0.09) 0%, transparent 68%)",
            filter: "blur(32px)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "-60px", right: "-40px",
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(246,122,223,0.08) 0%, transparent 68%)",
            filter: "blur(28px)",
          }}
        />
        <div
          style={{
            position: "absolute", top: "30%", right: "22%",
            width: 180, height: 260, borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
            transform: "rotate(6deg)",
          }}
        />
      </div>

      {/* Header — same style as workspace header */}
      <header
        className="relative z-10 flex items-center justify-between gap-4 px-5 flex-none"
        style={{
          minHeight: 60,
          background: "rgba(245,242,216,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(17,17,17,0.09)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 24px rgba(17,17,17,0.06)",
        }}
      >
        {/* Lime accent hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(202,255,67,0.45) 30%, rgba(202,255,67,0.6) 50%, rgba(202,255,67,0.45) 70%, transparent 100%)",
          }}
        />

        {/* Left: Logo + breadcrumb */}
        <div className="relative flex min-w-0 flex-1 items-center gap-3">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PathkrLogo size="md" variant="light" className="flex-none" />
          </Link>
          <div className="h-5 w-px flex-none" style={{ background: "rgba(17,17,17,0.15)" }} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-[3px]" style={{ color: "rgba(17,17,17,0.38)" }}>
              Workspace
              <span className="mx-1 opacity-50">/</span>
              Upload
            </p>
            <h1 className="flex items-center gap-1.5 font-display font-black leading-none tracking-[-0.035em] truncate" style={{ fontSize: "clamp(13px, 1.4vw, 17px)", color: "#141414", maxWidth: 380 }}>
              <span className="truncate">New Analysis</span>
              <span className="inline-flex flex-none items-center gap-0.5 rounded-full px-[0.45em] py-[0.12em]" style={{ background: "rgba(255,140,66,0.15)", border: "1px solid rgba(255,140,66,0.35)", color: "#6b2d00", fontSize: 10, fontWeight: 900, letterSpacing: "0.02em" }}>
                <Upload className="h-2.5 w-2.5" aria-hidden="true" />
                upload
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Back */}
        <div className="relative flex flex-none items-center gap-1.5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black text-[#141414] transition-all duration-150 active:scale-[0.97]"
            style={{ background: "rgba(17,17,17,0.06)", border: "1px solid rgba(17,17,17,0.13)" }}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>
      </header>

      {/* Body — centered upload card matching workspace panel style */}
      <div className="relative z-10 flex-1 overflow-hidden flex items-center justify-center p-4">
        <div
          className="w-full max-w-xl rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #201C14 0%, #1A170F 55%, #16130C 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-[#CAFF43]/15 text-[#CAFF43] text-[10px] font-bold px-2.5 py-0.5">AI-Powered</span>
                <span className="rounded-full bg-[#FF8C42]/15 text-[#FF8C42] text-[10px] font-bold px-2.5 py-0.5">Free</span>
                <span className="rounded-full bg-[#FF4FCB]/15 text-[#FF4FCB] text-[10px] font-bold px-2.5 py-0.5">Instant</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl text-[#F5F2D8] leading-tight">
                Analyze Your{" "}
                <span className="text-[#CAFF43]">CV</span>
              </h2>
              <p className="text-sm text-[#F5F2D8]/50 mt-2">
                Upload once. Get scored on clarity, keywords, impact &amp; ATS fit in under 60 seconds.
              </p>
            </div>

            {/* Failed state */}
            {state === "failed" && (
              <div className="w-full text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-[#FF4FCB]/15 border border-[#FF4FCB]/25 flex items-center justify-center mx-auto">
                  <span className="text-2xl">✕</span>
                </div>
                <div>
                  <h1 className="text-xl font-display font-extrabold text-[#F5F2D8] mb-2">Something went wrong</h1>
                  <p className="text-sm text-[#F5F2D8]/50">{progress?.message || "An error occurred while processing your CV."}</p>
                </div>
                <button onClick={handleReset} className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold px-8 py-3 hover:bg-[#CAFF43]/85 transition-colors">
                  Try Again
                </button>
              </div>
            )}

            {/* Complete state — transient while navigating */}
            {state === "complete" && (
              <div className="w-full space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#CAFF43] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-[#141414]" />
                  </div>
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-[#F5F2D8]">Analysis Complete!</h2>
                    <p className="text-xs text-[#F5F2D8]/50">Your CV has been scored across all dimensions</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Clarity", color: "bg-[#CAFF43]/15 text-[#CAFF43]" },
                    { label: "Keywords", color: "bg-[#FF4FCB]/15 text-[#FF4FCB]" },
                    { label: "ATS Fit", color: "bg-[#8B5CF6]/15 text-[#8B5CF6]" },
                    { label: "Impact", color: "bg-[#FF8C42]/15 text-[#FF8C42]" },
                  ].map(({ label, color }) => (
                    <span key={label} className={`rounded-full text-xs font-bold px-3 py-1 ${color}`}>✦ {label}</span>
                  ))}
                </div>
                <div className="w-full rounded-[1.75rem] border border-[#CAFF43]/20 bg-[#CAFF43]/10 px-5 py-4 text-center" aria-live="polite">
                  <p className="text-sm font-bold text-[#CAFF43]">Opening workspace…</p>
                  <p className="mt-1 text-xs text-[#F5F2D8]/60">We&apos;re loading your analysis workspace.</p>
                </div>
              </div>
            )}

            {/* Upload zone */}
            {state === "idle" && (
              <UploadZone onFileSelected={handleFileSelected} disabled={uploadMutation.isPending} />
            )}

            {/* File preview */}
            {state === "preview" && selectedFile && (
              <DocumentPreview file={selectedFile} onAnalyze={handleAnalyze} isAnalyzing={uploadMutation.isPending} />
            )}

            {/* Processing stages */}
            {state === "processing" && (
              <ProcessingStages
                currentStage={progress?.stage ?? "uploading"}
                percentage={progress?.percentage ?? 0}
                message={progress?.message ?? "Starting analysis..."}
              />
            )}

            {/* SSE reconnect indicator */}
            {jobId && !isConnected && !streamError && state === "processing" && (
              <div className="mt-4 text-center text-sm text-[#FF8C42]/70">Reconnecting to server...</div>
            )}

            {/* SSE error */}
            {streamError && state === "processing" && (
              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-[#FF4FCB]">Connection lost. Please try again.</p>
                <button onClick={handleReset} className="text-sm text-[#CAFF43] hover:underline">Start over</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer — placeholder to match workspace layout */}
      <footer
        className="relative z-20 flex-none px-5 py-2.5"
        style={{
          background: "rgba(245,242,216,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(17,17,17,0.1)",
          boxShadow: "0 -4px 24px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.70)",
        }}
      >
        <div className="flex justify-between items-center gap-3 w-full">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black" style={{ background: "rgba(17,17,17,0.05)", border: "1px solid rgba(17,17,17,0.10)", color: "#555" }}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Upload a CV to get started</span>
            </span>
          </div>
          <div className="text-[10px] text-[#141414]/40 font-medium">
            PDF or DOCX · Max 5 MB · No sign-up required
          </div>
        </div>
      </footer>
    </div>
  );
}
