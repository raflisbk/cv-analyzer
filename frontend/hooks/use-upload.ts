
"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadFile, ApiError, type UploadOptions } from "@/lib/api";
import { toast } from "sonner";

interface UploadPayload {
  file: File;
  options?: UploadOptions;
}

export function useUpload() {
  return useMutation<{ job_id: string }, ApiError, UploadPayload>({
    mutationFn: async ({ file, options = {} }: UploadPayload) => {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (file.size > maxSize) {
        throw new ApiError(
          "FILE_TOO_LARGE",
          "File size exceeds 5MB limit. Please compress or split your CV."
        );
      }

      if (!allowedTypes.includes(file.type)) {
        throw new ApiError(
          "INVALID_FILE_TYPE",
          "Only PDF and DOCX files are supported."
        );
      }

      return uploadFile(file, options);
    },
    onError: (error: ApiError) => {
      toast.error(error.message, {
        description: "Please check your file and try again.",
        duration: 5000,
      });
    },
  });
}
