"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
import { getWorkspaceRoute } from "@/lib/job-routes";
import { toast } from "sonner";

type UploadState = "idle" | "preview" | "processing" | "complete" | "failed";

export function UploadPanel() {
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
    <div className="flex h-full w-full items-center justify-center p-6">
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
  );
}
