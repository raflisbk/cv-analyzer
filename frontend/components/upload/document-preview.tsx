"use client";

import { FileText } from "lucide-react";

interface DocumentPreviewProps {
  file: File;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function DocumentPreview({ file, onAnalyze, isAnalyzing }: DocumentPreviewProps) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileType = file.name.endsWith(".pdf") ? "PDF" : "DOCX";

  return (
    <div className="w-full">
      <div className="flex items-start gap-4 p-5 rounded-2xl border border-[#F5F2D8]/10 bg-[#F5F2D8]/3">
        {/* File icon */}
        <div className="flex-shrink-0 w-[72px] h-[72px] rounded-xl border border-[#F5F2D8]/15 bg-[#F5F2D8]/5 flex items-center justify-center">
          <FileText className="w-8 h-8 text-[#CAFF43]" />
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-sm font-extrabold text-[#F5F2D8] truncate mb-1">
            {file.name}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="rounded-full bg-[#CAFF43]/15 text-[#CAFF43] text-xs font-bold px-2.5 py-0.5">
              {fileType}
            </span>
            <span className="text-xs text-[#F5F2D8]/40">{fileSizeMB} MB</span>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                       px-6 py-2.5 hover:bg-[#CAFF43]/85 transition-colors duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Starting Analysis..." : "Analyze CV"}
          </button>
        </div>
      </div>
    </div>
  );
}
