"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
import { useUploadModal } from "@/components/providers/upload-modal-provider";
import { getWorkspaceRoute } from "@/lib/job-routes";
import { toast } from "sonner";

interface UploadSectionProps {
  compact?: boolean;
  onProcessingChange?: (isProcessing: boolean) => void;
}

export default function UploadSection({
  compact: _compact = false,
  onProcessingChange,
}: UploadSectionProps) {
  const router = useRouter();
  const { closeModal } = useUploadModal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const hasNavigatedToWorkspaceRef = useRef(false);

  const uploadMutation = useUpload();

  // Report isProcessing state to parent (needed by UploadOverlay to block close)
  useEffect(() => {
    const processing = jobId !== null && completedJobId === null;
    onProcessingChange?.(processing);
  }, [jobId, completedJobId, onProcessingChange]);

  useEffect(() => {
    if (!completedJobId || hasNavigatedToWorkspaceRef.current) {
      return;
    }

    hasNavigatedToWorkspaceRef.current = true;
    closeModal();
    router.push(getWorkspaceRoute(completedJobId));
  }, [closeModal, completedJobId, router]);

  // Pass onComplete callback to useJobStream per D-19, UI-SPEC §8
  const { progress, isConnected, error: streamError } = useJobStream(jobId, {
    onComplete: (id) => {
      setCompletedJobId(id);
    },
  });

  // UI state machine
  const isUploading = uploadMutation.isPending;
  const isProcessing = jobId !== null && completedJobId === null;
  const showUploadZone = !selectedFile && !isProcessing && !completedJobId;
  const showPreview = selectedFile !== null && !isProcessing && !completedJobId;

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
    hasNavigatedToWorkspaceRef.current = false;
    uploadMutation.reset();
  };

  // Handle processing failed
  if (progress?.stage === "failed") {
    return (
      <div className="w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#FF4FCB]/15 border border-[#FF4FCB]/25 flex items-center justify-center mx-auto">
          <span className="text-2xl">✕</span>
        </div>
        <div>
          <h1 className="text-xl font-display font-extrabold text-[#F5F2D8] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[#F5F2D8]/50">
            {progress.message || "An error occurred while processing your CV."}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                     px-8 py-3 hover:bg-[#CAFF43]/85 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show transient completion state while workspace navigation opens
  if (completedJobId) {
    return (
      <div className="w-full space-y-5">
        {/* Completion header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#CAFF43] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-[#141414]" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg text-[#F5F2D8]">
              Analysis Complete!
            </h2>
            <p className="text-xs text-[#F5F2D8]/50">
              Your CV has been scored across all dimensions
            </p>
          </div>
        </div>

        {/* Score dimension pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Clarity", color: "bg-[#CAFF43]/15 text-[#CAFF43]" },
            { label: "Keywords", color: "bg-[#FF4FCB]/15 text-[#FF4FCB]" },
            { label: "ATS Fit", color: "bg-[#8B5CF6]/15 text-[#8B5CF6]" },
            { label: "Impact", color: "bg-[#FF8C42]/15 text-[#FF8C42]" },
          ].map(({ label, color }) => (
            <span key={label} className={`rounded-full text-xs font-bold px-3 py-1 ${color}`}>
              ✦ {label}
            </span>
          ))}
        </div>

        <div
          className="w-full rounded-[1.75rem] border border-[#CAFF43]/20 bg-[#CAFF43]/10 px-5 py-4 text-center"
          aria-live="polite"
        >
          <p className="text-sm font-bold text-[#CAFF43]">Opening workspace…</p>
          <p className="mt-1 text-xs text-[#F5F2D8]/60">
            We&apos;re taking you into the job workspace for this analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showUploadZone && (
        <UploadZone
          onFileSelected={handleFileSelected}
          disabled={isUploading}
        />
      )}

      {showPreview && selectedFile && (
        <DocumentPreview
          file={selectedFile}
          onAnalyze={handleAnalyze}
          isAnalyzing={isUploading}
        />
      )}

      {isProcessing && (
        <ProcessingStages
          currentStage={progress?.stage ?? "uploading"}
          percentage={progress?.percentage ?? 0}
          message={progress?.message ?? "Starting analysis..."}
        />
      )}

      {jobId && !isConnected && !streamError && (
        <div className="mt-4 text-center text-sm text-[#FF8C42]/70">
          Reconnecting to server...
        </div>
      )}

      {streamError && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-[#FF4FCB]">Connection lost. Please try again.</p>
          <button
            onClick={handleReset}
            className="text-sm text-[#CAFF43] hover:underline"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
