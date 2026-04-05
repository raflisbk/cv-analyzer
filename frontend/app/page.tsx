"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";
import { DocumentPreview } from "@/components/upload/document-preview";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUpload } from "@/hooks/use-upload";
import { useJobStream } from "@/hooks/use-job-stream";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [completedJobId, setCompletedJobId] = useState<string | null>(null);

  const uploadMutation = useUpload();

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
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4 text-red-600">✕</div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Processing Failed
          </h1>
          <p className="text-base text-slate-600">
            {progress.message || "An error occurred while processing your CV."}
          </p>
          <Button onClick={handleReset}>Try Again</Button>
        </div>
      </main>
    );
  }

  // Show "View Results" button after SSE 'complete' per D-19, UI-SPEC §7 A
  if (completedJobId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-[600px] w-full mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Analyzing Your CV
            </h2>
            {/* All stages complete */}
            <div className="space-y-2">
              {["Uploading", "Extracting text", "Validating quality", "Complete"].map(
                (stage) => (
                  <div
                    key={stage}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {stage}
                  </div>
                )
              )}
            </div>
            {/* Analysis complete message per UI-SPEC §7 A */}
            <p className="text-sm text-green-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Analysis complete!
            </p>
            {/* "View Results" button per D-19, UI-SPEC §7 A */}
            <Button
              className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
              onClick={() => router.push(`/results/${completedJobId}`)}
            >
              View Results
            </Button>
          </CardContent>
        </Card>
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
        {isProcessing && (
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
              onClick={handleReset}
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
