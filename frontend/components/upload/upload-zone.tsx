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
        onFileSelected(acceptedFiles[0]); // Per D-03: single file upload only
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
    maxSize: 5 * 1024 * 1024, // 5MB per D-02
    multiple: false, // Per D-03
    disabled,
    noClick: true, // Prevent double-open; button uses explicit open()
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center",
        "min-h-[220px] w-full",
        "border-2 border-dashed rounded-2xl",
        "px-8 py-10",
        "transition-all duration-200 ease-out cursor-pointer",
        isDragOver || isDragActive
          ? "border-[#CAFF43] bg-[#CAFF43]/5 scale-[1.01]"
          : "border-[#F5F2D8]/20 bg-[#F5F2D8]/3 hover:border-[#CAFF43]/50 hover:scale-[1.01]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />

      <Upload
        className={cn(
          "w-12 h-12 mb-4",
          isDragOver || isDragActive ? "text-[#CAFF43]" : "text-[#F5F2D8]/30"
        )}
      />

      <h2 className="text-lg font-display font-extrabold text-[#F5F2D8] mb-2 text-center">
        {isDragOver ? "Drop your CV here" : "Drop your CV or click to browse"}
      </h2>

      <p className="text-sm text-[#F5F2D8]/50 mb-5 text-center">
        Get instant AI feedback on clarity, impact, and ATS compatibility.
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); open(); }}
        className="rounded-full bg-[#CAFF43] text-[#141414] text-sm font-display font-extrabold
                   px-6 py-2.5 hover:bg-[#CAFF43]/85 transition-colors duration-150
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Choose File
      </button>

      <p className="text-xs text-[#F5F2D8]/30 mt-4">
        PDF or DOCX · max 5MB
      </p>
    </div>
  );
}
