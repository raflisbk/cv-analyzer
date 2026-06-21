"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, CheckCircle2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
import { getWorkspaceRoute } from "@/lib/job-routes";
import { SUPPORTED_ROLES } from "@/lib/types";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "preview" | "processing" | "complete" | "failed";

export function UploadPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentJobId = searchParams.get("reanalyze");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleAnalyze = async () => {
    if (!selectedFile) { return; }
    try {
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        options: {
          targetRole: targetRole || undefined,
          parentJobId: parentJobId || undefined,
        },
      });
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
    setTargetRole("");
    setJobId(null);
    setCompletedJobId(null);
    hasNavigatedRef.current = false;
    uploadMutation.reset();
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
    setIsDragOver(false);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected: () => {
      toast.error("Invalid file", {
        description: "Only PDF or DOCX files up to 5MB are supported.",
        duration: 5000,
      });
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: uploadMutation.isPending,
    noClick: true,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  if (state === "processing") {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ProcessingStages
            currentStage={progress?.stage ?? "uploading"}
            percentage={progress?.percentage ?? 0}
            message={progress?.message ?? "Starting analysis..."}
          />
          {jobId && !isConnected && !streamError && (
            <div className="mt-4 text-center text-sm text-[#F5F2D8]/50">
              Reconnecting to server...
            </div>
          )}
          {streamError && (
            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-[#FF4FCB]">Connection lost. Please try again.</p>
              <button onClick={handleReset} className="text-sm text-[#CAFF43] hover:underline">
                Start over
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CAFF43] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-[#141414]" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-extrabold text-lg text-[#F5F2D8]">
                Analysis Complete!
              </h2>
              <p className="text-xs text-[#F5F2D8]/50">
                Your CV has been scored across all dimensions
              </p>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-[#CAFF43]/20 bg-[#CAFF43]/10 px-5 py-4 text-center" aria-live="polite">
            <p className="text-sm font-bold text-[#CAFF43]">Opening workspace...</p>
            <p className="mt-1 text-xs text-[#F5F2D8]/60">
              Loading your analysis workspace.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#FF4FCB]/15 border border-[#FF4FCB]/25 flex items-center justify-center mx-auto">
            <span className="text-2xl text-[#FF4FCB]">✕</span>
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold text-[#F5F2D8] mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#F5F2D8]/50">
              {progress?.message || "An error occurred while processing your CV."}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold px-8 py-3 hover:bg-[#CAFF43]/85 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state === "preview" && selectedFile) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <DocumentPreview
            file={selectedFile}
            onAnalyze={handleAnalyze}
            isAnalyzing={uploadMutation.isPending}
            targetRole={targetRole}
            onTargetRoleChange={setTargetRole}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        "transition-all duration-200 ease-out cursor-pointer",
        isDragOver || isDragActive
          ? "bg-[#CAFF43]/5"
          : "hover:bg-[#CAFF43]/[0.02]"
      )}
    >
      <input {...getInputProps()} />

      <div className={cn(
        "flex flex-col items-center justify-center text-center px-8 py-10",
        "w-full max-w-sm"
      )}>
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-200",
          isDragOver || isDragActive
            ? "bg-[#CAFF43] text-[#141414]"
            : "bg-[#CAFF43]/12 text-[#CAFF43]"
        )}>
          <Upload className="w-7 h-7" />
        </div>

        {parentJobId && (
          <div className="mb-4 rounded-xl border border-[#CAFF43]/20 bg-[#CAFF43]/8 px-4 py-2.5 text-center w-full">
            <p className="text-xs font-bold text-[#CAFF43]">Re-analyzing — upload your updated CV</p>
            <p className="text-[10px] text-[#CAFF43]/50 mt-0.5">Score delta will appear in version history</p>
          </div>
        )}

        <h2 className="font-display font-extrabold text-lg text-[#F5F2D8] mb-1.5">
          {isDragOver ? "Drop it!" : parentJobId ? "Drop your updated CV" : "Drop your CV here"}
        </h2>
        <p className="text-xs text-[#F5F2D8]/40 mb-5 max-w-[220px]">
          AI scores your CV on clarity, keywords, impact &amp; ATS compatibility
        </p>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); open(); }}
          className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                     px-6 py-2.5 hover:bg-[#CAFF43]/85 active:scale-95 transition-all duration-150"
        >
          Choose File
        </button>

        <p className="text-[10px] text-[#F5F2D8]/25 mt-3">
          PDF or DOCX · max 5 MB
        </p>
      </div>
    </div>
  );
}
