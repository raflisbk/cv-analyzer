"use client";

import { ArrowRight } from "lucide-react";
import { useUploadModal } from "@/components/providers/upload-modal-provider";

export default function UploadZoneCTA() {
  const { openModal } = useUploadModal();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={openModal}
        className="rounded-full bg-[#F5F2D8] text-[#141414] font-extrabold text-base
                   px-7 py-3 hover:bg-white transition-colors duration-150"
      >
        Analyze My CV
      </button>
      <button
        onClick={openModal}
        aria-label="Start CV analysis"
        className="w-14 h-14 rounded-full bg-[#CAFF43] flex items-center justify-center
                   hover:bg-[#CAFF43]/85 transition-colors duration-150 flex-shrink-0"
      >
        <ArrowRight className="w-5 h-5 text-[#141414]" />
      </button>
      <p className="text-xs text-[#F5F2D8]/40 sm:ml-2">
        PDF or DOCX · Max 10 MB
      </p>
    </div>
  );
}
