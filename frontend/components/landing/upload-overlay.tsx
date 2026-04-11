"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccentPill } from "@/components/ui/accent-pill";
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4
                   max-w-none w-screen h-screen rounded-none border-0
                   bg-[#141414]/90 backdrop-blur-md shadow-none
                   !left-0 !top-0 !translate-x-0 !translate-y-0
                   data-[state=open]:animate-in data-[state=open]:fade-in-0
                   data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0
                   data-[state=closed]:animate-out data-[state=closed]:fade-out-0
                   data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0
                   duration-200"
        onEscapeKeyDown={(e) => { if (isProcessing) { e.preventDefault(); } }}
        onInteractOutside={(e) => e.preventDefault()}
        hideCloseButton
        aria-labelledby="upload-overlay-title"
      >
        {/* Processing banner */}
        {isProcessing && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-[#FF8C42]/15 border-b border-[#FF8C42]/30 px-4 py-2 flex items-center justify-center gap-2 text-sm text-[#FF8C42] font-bold">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Processing — please keep this window open
          </div>
        )}

        {/* Close button */}
        <button
          aria-label="Close upload overlay"
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 z-10 rounded-full w-10 h-10
                     flex items-center justify-center
                     bg-[#F5F2D8]/8 text-[#F5F2D8]/60 hover:bg-[#F5F2D8]/15 hover:text-[#F5F2D8]
                     focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/50
                     transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Card */}
        <div className="relative bg-[#1C1C1C] rounded-[2rem] border border-[#F5F2D8]/8 p-8 md:p-10 w-full max-w-2xl overflow-hidden">

          {/* Decorative circles — matching hero card */}
          <div className="absolute top-6 right-10 w-4 h-4 rounded-full bg-[#CAFF43] opacity-70" aria-hidden="true" />
          <div className="absolute top-12 right-20 w-2.5 h-2.5 rounded-full bg-[#FF4FCB] opacity-60" aria-hidden="true" />
          <div className="absolute top-5 right-32 w-6 h-6 rounded-full bg-[#FF8C42] opacity-35" aria-hidden="true" />
          <div className="absolute bottom-8 left-6 w-3 h-3 rounded-full bg-[#8B5CF6] opacity-50" aria-hidden="true" />
          <div className="absolute bottom-5 left-16 w-5 h-5 rounded-full bg-[#CAFF43] opacity-20" aria-hidden="true" />

          {/* Header */}
          <div className="mb-6 relative">
            <div className="flex items-center gap-2 mb-3">
              <AccentPill color="lime" size="sm">AI-Powered</AccentPill>
              <AccentPill color="orange" size="sm">Free</AccentPill>
              <AccentPill color="pink" size="sm">Instant</AccentPill>
            </div>
            <DialogTitle
              id="upload-overlay-title"
              className="font-display font-extrabold text-3xl text-[#F5F2D8] leading-tight"
            >
              Analyze Your{" "}
              <span className="text-[#CAFF43]">CV</span>
            </DialogTitle>
            <p className="text-sm text-[#F5F2D8]/50 mt-2">
              Upload once. Get scored on clarity, keywords, impact & ATS fit in under 60 seconds.
            </p>
          </div>

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
