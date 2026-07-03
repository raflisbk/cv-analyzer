"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelected, disabled = false }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelected(acceptedFiles[0]);
      }
      setIsDragOver(false);
    },
    [onFileSelected]
  );

  const onDropRejected = useCallback(() => {
    toast.error("Invalid file", {
      description: "Only PDF or DOCX files up to 5MB are supported.",
      duration: 5000,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled,
    noClick: true,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex flex-col items-center justify-center",
        "w-full rounded-2xl border-2 border-dashed",
        "px-8 py-10 cursor-pointer",
        "transition-all duration-200 ease-out",
        isDragOver || isDragActive
          ? "border-[#CAFF43] bg-[#CAFF43]/6 scale-[1.01]"
          : "border-[#F5F2D8]/15 hover:border-[#CAFF43]/50 hover:bg-[#CAFF43]/3",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />

      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-colors duration-200",
        isDragOver || isDragActive
          ? "bg-[#CAFF43] text-[#141414]"
          : "bg-[#CAFF43]/15 text-[#CAFF43]"
      )}>
        <Upload className="w-9 h-9" />
      </div>

      <h2 className="text-xl font-display font-extrabold text-[#F5F2D8] mb-2 text-center">
        {isDragOver ? "Drop it!" : "Drop your CV here"}
      </h2>
      <p className="text-sm text-[#F5F2D8]/50 mb-6 text-center max-w-xs">
        AI scores your CV on clarity, keywords, impact & ATS compatibility
      </p>

      <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
        <span className="rounded-full bg-[#CAFF43]/15 text-[#CAFF43] text-xs font-bold px-3 py-1">
          ✦ AI Scoring
        </span>
        <span className="rounded-full bg-[#FF8C42]/15 text-[#FF8C42] text-xs font-bold px-3 py-1">
          ✦ Skill Gap
        </span>
        <span className="rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-xs font-bold px-3 py-1">
          ✦ ATS Check
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); open(); }}
        className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                   px-8 py-3 hover:bg-[#CAFF43]/85 active:scale-95 transition-all duration-150
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Choose File
      </button>

      <p className="text-xs text-[#F5F2D8]/30 mt-4">PDF or DOCX · max 5 MB</p>
    </div>
  );
}
