"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/use-upload";
import styles from "./app-shell.module.css";

export default function UploadCvButton({
  label = "Upload CV",
  onUploaded,
}: {
  label?: string;
  onUploaded?: (jobId: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUpload();
  const router = useRouter();
  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        aria-label="Choose a CV file"
        onChange={(event) => {
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
        }}
      />
      <button
        className={`${styles.pill} ${styles.punk}`}
        type="button"
        disabled={upload.isPending}
        onClick={() => input.current?.click()}
      >
        {upload.isPending ? "Uploading…" : label}
      </button>
    </>
  );
}
