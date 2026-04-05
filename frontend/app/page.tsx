"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
import { toast } from "sonner";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const uploadMutation = useUpload();
  const { progress, isConnected, error: streamError } = useJobStream(jobId);

  // UI state machine per UI-SPEC section 7
  const isUploading = uploadMutation.isPending;
  const isProcessing = jobId !== null;
  const showUploadZone = !selectedFile && !isProcessing;
  const showPreview = selectedFile !== null && !isProcessing;
  const showProcessing = isProcessing;

  // Handle file selection per UI-SPEC section 7 step 1
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  // Handle analyze button click per UI-SPEC section 7 step 3
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
      // Error already handled by useUpload onError
      console.error("Upload failed:", error);
    }
  };

  // Handle processing complete per UI-SPEC section 7 step 5
  if (progress?.stage === "complete") {
    // TODO: Transition to results view (Phase 2)
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Analysis Complete!
          </h1>
          <p className="text-base text-slate-600">
            Your CV has been analyzed successfully. Results will be displayed
            here in Phase 2.
          </p>
          <button
            onClick={() => {
              setSelectedFile(null);
              setJobId(null);
              uploadMutation.reset();
            }}
            className="text-blue-600 hover:underline"
          >
            Analyze another CV
          </button>
        </div>
      </main>
    );
  }

  // Handle processing failed per UI-SPEC section 7 step 5
  if (progress?.stage === "failed") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4 text-red-600">✕</div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Processing Failed
          </h1>
          <p className="text-base text-slate-600">
            {progress.message || "An error occurred while processing your CV."}
          </p>
          <button
            onClick={() => {
              setSelectedFile(null);
              setJobId(null);
              uploadMutation.reset();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl">
        {/* Per D-05: Upload component is hero-centered on landing page */}
        {showUploadZone && (
          <UploadZone
            onFileSelected={handleFileSelected}
            disabled={isUploading}
          />
        )}

        {/* Per UI-SPEC section 7 step 2: Show preview after file selection */}
        {showPreview && selectedFile && (
          <DocumentPreview
            file={selectedFile}
            onAnalyze={handleAnalyze}
            isAnalyzing={isUploading}
          />
        )}

        {/* Per UI-SPEC section 7 step 4: Show progress during processing */}
        {showProcessing && (
          <ProcessingStages
            currentStage={progress?.stage ?? "uploading"}
            percentage={progress?.percentage ?? 0}
            message={progress?.message ?? "Starting analysis..."}
          />
        )}

        {/* Show reconnection indicator per D-15 */}
        {jobId && !isConnected && !streamError && (
          <div className="mt-4 text-center text-sm text-amber-600">
            Reconnecting to server...
          </div>
        )}

        {/* Show SSE error if reconnection failed */}
        {streamError && (
          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-red-600">Connection lost. Please try again.</p>
            <button
              onClick={() => {
                setSelectedFile(null);
                setJobId(null);
                uploadMutation.reset();
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
