"use client";

import { useAppShellUploadButton } from "@/hooks/use-app-shell-upload-button";
import styles from "./app-shell.module.css";

export default function UploadCvButton({
  label = "Upload CV",
  onUploaded,
}: {
  label?: string;
  onUploaded?: (jobId: string) => void;
}) {
  const { input, upload, onChange } = useAppShellUploadButton(onUploaded);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        aria-label="Choose a CV file"
        onChange={onChange}
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
