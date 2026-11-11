"use client";

import { useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/use-upload";

export function useAppShellUploadButton(onUploaded?: (jobId: string) => void) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUpload();
  const router = useRouter();
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      upload.mutate(
        { file },
        {
          onSuccess: ({ job_id }) =>
            onUploaded
              ? onUploaded(job_id)
              : router.push(`/app/cvs/${job_id}?view=editor`),
        },
      );
    }
    event.target.value = "";
  };
  return { input, upload, onChange };
}
