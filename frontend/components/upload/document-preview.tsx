"use client";

import { FileText, CheckCircle2 } from "lucide-react";
import { SUPPORTED_ROLES } from "@/lib/types";

interface DocumentPreviewProps {
  file: File;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  targetRole?: string;
  onTargetRoleChange?: (role: string) => void;
}

export function DocumentPreview({
  file,
  onAnalyze,
  isAnalyzing,
  targetRole = "",
  onTargetRoleChange,
}: DocumentPreviewProps) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileType = file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";
  const fileTypeColor = fileType === "PDF"
    ? "bg-[#FF8C42]/15 text-[#FF8C42]"
    : "bg-[#8B5CF6]/15 text-[#8B5CF6]";

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#F5F2D8]/10 bg-[#141414]">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#FF8C42]/15 border border-[#FF8C42]/20 flex items-center justify-center">
          <FileText className="w-7 h-7 text-[#FF8C42]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-[#F5F2D8] truncate mb-1.5">
            {file.name}
          </p>
          <div className="flex items-center gap-2">
            <span className={`rounded-full text-xs font-bold px-2.5 py-0.5 ${fileTypeColor}`}>
              {fileType}
            </span>
            <span className="text-xs text-[#F5F2D8]/40">{fileSizeMB} MB</span>
            <span className="flex items-center gap-1 text-xs text-[#CAFF43] font-bold ml-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>
      </div>

      {onTargetRoleChange && (
        <div>
          <label className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2D8]/40 block mb-2">
            Target Role <span className="normal-case font-normal">(optional — improves scoring accuracy)</span>
          </label>
          <select
            value={targetRole}
            onChange={(e) => onTargetRoleChange(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F2D8] focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/30 appearance-none cursor-pointer"
          >
            <option value="">General (no specific role)</option>
            {SUPPORTED_ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          {targetRole && (
            <p className="text-xs text-[#CAFF43]/60 mt-1.5">
              ✦ Anchors calibrated for {SUPPORTED_ROLES.find((r) => r.id === targetRole)?.label}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Clarity Score", color: "bg-[#CAFF43]/12 text-[#CAFF43]" },
          { label: "Keyword Match", color: "bg-[#FF4FCB]/12 text-[#FF4FCB]" },
          { label: "ATS Score", color: "bg-[#8B5CF6]/12 text-[#8B5CF6]" },
          { label: "Impact Score", color: "bg-[#FF8C42]/12 text-[#FF8C42]" },
        ].map(({ label, color }) => (
          <span key={label} className={`rounded-full text-xs font-bold px-3 py-1 ${color}`}>
            ✦ {label}
          </span>
        ))}
      </div>

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full rounded-full bg-[#CAFF43] text-[#141414] font-display font-extrabold
                   py-3.5 text-base hover:bg-[#CAFF43]/85 active:scale-[0.99] transition-all duration-150
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? "Starting Analysis…" : "Analyze My CV →"}
      </button>
    </div>
  );
}
