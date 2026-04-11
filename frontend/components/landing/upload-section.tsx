"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const uploadMutation = useUpload();

  // Report isProcessing state to parent (needed by UploadOverlay to block close)
  useEffect(() => {
    const processing = jobId !== null && completedJobId === null;
    onProcessingChange?.(processing);
  }, [jobId, completedJobId, onProcessingChange]);

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
    uploadMutation.reset();
  };

  // Handle processing failed
  if (progress?.stage === "failed") {
    return (
      <div className="w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-2xl text-red-400">✕</span>
        </div>
        <h1 className="text-xl font-display font-extrabold text-[#F5F2D8]">
          Processing Failed
        </h1>
        <p className="text-sm text-[#F5F2D8]/50">
          {progress.message || "An error occurred while processing your CV."}
        </p>
        <button
          onClick={handleReset}
          className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                     px-6 py-2.5 hover:bg-[#CAFF43]/85 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show "View Results" button after SSE 'complete' per D-19, UI-SPEC §7 A
  if (completedJobId) {
    return (
      <div className="w-full space-y-5">
        <h2 className="font-display font-extrabold text-lg text-[#F5F2D8]">
          Analysis Complete!
        </h2>
        <div className="space-y-2.5">
          {["Uploading", "Extracting text", "Validating quality", "Complete"].map(
            (stage) => (
              <div key={stage} className="flex items-center gap-3 text-[#F5F2D8]/40">
                <CheckCircle2 className="h-4 w-4 text-[#CAFF43] flex-shrink-0" />
                <span className="text-sm">{stage}</span>
              </div>
            )
          )}
        </div>
        <p className="text-sm text-[#CAFF43] font-bold flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          Your CV is ready to view
        </p>
        <button
          disabled={isNavigating}
          onClick={async () => {
            setIsNavigating(true);
            await router.push(`/results/${completedJobId}`);
          }}
          className="w-full rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                     py-3 hover:bg-[#CAFF43]/85 transition-colors duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isNavigating ? "Loading results..." : "View Results"}
        </button>
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
        <div className="mt-4 text-center text-sm text-amber-400/70">
          Reconnecting to server...
        </div>
      )}

      {streamError && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-red-400">Connection lost. Please try again.</p>
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
