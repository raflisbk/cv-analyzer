"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import UploadSection from "@/components/landing/upload-section";
import { useUploadModal } from "@/components/providers/upload-modal-provider";

export default function UploadOverlay() {
  const { isOpen, closeModal, openCount } = useUploadModal();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    if (!isProcessing) { closeModal(); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        // Override default centered-modal styles → full-screen
        className="fixed inset-0 z-50 flex items-center justify-center p-4
                   max-w-none w-screen h-screen rounded-none border-0
                   bg-[#141414]/85 backdrop-blur-sm shadow-none
                   !left-0 !top-0 !translate-x-0 !translate-y-0
                   data-[state=open]:animate-in data-[state=open]:fade-in-0
                   data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0
                   data-[state=closed]:animate-out data-[state=closed]:fade-out-0
                   data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0
                   duration-200"
        // Block close during processing
        onEscapeKeyDown={(e) => {
          if (isProcessing) { e.preventDefault(); }
        }}
        // Always block outside-click (user must use the explicit × button)
        onInteractOutside={(e) => e.preventDefault()}
        // Hide built-in DialogPrimitive.Close — we render our own controlled button
        hideCloseButton
        // Accessibility
        aria-labelledby="upload-overlay-title"
      >
        {/* Processing lock banner — shown while upload or SSE streaming is active */}
        {isProcessing && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Processing — please keep this window open
          </div>
        )}

        {/* Custom close button — disabled during processing */}
        <button
          aria-label="Close upload overlay"
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 z-10 rounded-full w-9 h-9
                     flex items-center justify-center
                     text-[#F5F2D8]/50 hover:text-[#F5F2D8] hover:bg-[#F5F2D8]/10
                     focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/50
                     transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Upload panel — centered card */}
        <div className="relative bg-[#1C1C1C] rounded-2xl border border-[#F5F2D8]/10 p-8 md:p-10 w-full max-w-2xl">
          <DialogTitle
            id="upload-overlay-title"
            className="font-display font-extrabold text-2xl text-[#F5F2D8] mb-1"
          >
            Analyze Your CV
          </DialogTitle>
          <p className="text-sm text-[#F5F2D8]/50 mb-6">
            Drop your CV below. We&apos;ll score it in under 60 seconds.
          </p>
          {/*
            key={openCount} forces a full remount of UploadSection on every open.
            This clears selectedFile / jobId / completedJobId so users always see
            a fresh upload zone rather than a stale "Analysis Complete!" state.
            See: RESEARCH.md Pitfall 3 (Stale Upload State on Overlay Reopen)
          */}
          <UploadSection
            key={openCount}
            compact
            onProcessingChange={setIsProcessing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
