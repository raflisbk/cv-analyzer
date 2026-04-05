/**
 * Upload file mutation hook
 * Implements file upload with React Query
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadFile, ApiError } from "@/lib/api";
import { toast } from "sonner";

export function useUpload() {
  return useMutation<{ job_id: string }, ApiError, File>({
    mutationFn: async (file: File) => {
      // Client-side validation before upload per ERROR-01
      const maxSize = 5 * 1024 * 1024; // 5MB per D-02
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

      return uploadFile(file);
    },
    onError: (error: ApiError) => {
      // Display toast error per D-07
      toast.error(error.message, {
        description: "Please check your file and try again.",
        duration: 5000,
      });
    },
  });
}
