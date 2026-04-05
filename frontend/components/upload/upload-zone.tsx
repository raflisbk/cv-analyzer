"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        // Per UI-SPEC: Min height 240px, max width 600px, centered
        "flex flex-col items-center justify-center",
        "min-h-[240px] max-w-[600px] mx-auto",
        "border-2 border-dashed rounded-lg",
        "px-8 py-12 sm:px-12", // Per UI-SPEC section 8: responsive padding
        "transition-all duration-200 ease-out",
        // Per UI-SPEC: Border color states
        isDragOver || isDragActive
          ? "border-blue-500 bg-blue-50 scale-[1.01]" // drag-over state
          : "border-slate-300 bg-white hover:border-blue-500 hover:scale-[1.01]", // idle/hover
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />

      {/* Icon per UI-SPEC */}
      <Upload
        className={cn(
          "w-16 h-16 mb-4",
          isDragOver || isDragActive ? "text-blue-600" : "text-slate-400"
        )}
      />

      {/* Copy per UI-SPEC section 6 */}
      <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">
        {isDragOver ? "Drop your CV here" : "Upload Your CV for AI-Powered Analysis"}
      </h2>

      <p className="text-sm text-slate-500 mb-4 text-center">
        Get instant feedback on clarity, impact, and ATS compatibility.
      </p>

      <p className="text-sm text-slate-400 mb-4">
        Drag & drop your CV here or
      </p>

      {/* Per D-01: file picker button equally visible */}
      <Button variant="outline" type="button" disabled={disabled}>
        Choose File
      </Button>

      <p className="text-sm text-slate-500 mt-4">
        PDF or DOCX, max 5MB
      </p>
    </div>
  );
}
