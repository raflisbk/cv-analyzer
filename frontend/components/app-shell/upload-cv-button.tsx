"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { useAppShellUploadButton } from "@/hooks/use-app-shell-upload-button";
import styles from "./app-shell.module.css";

export default function UploadCvButton({
  label,
  onUploaded,
}: {
  label?: string;
  onUploaded?: (jobId: string) => void;
}) {
  const { t } = useT();
  const { input, upload, onChange } = useAppShellUploadButton(onUploaded);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        aria-label={t("app.upload.choose")}
        onChange={onChange}
      />
      <button
        className={`${styles.pill} ${styles.punk}`}
        type="button"
        disabled={upload.isPending}
        onClick={() => input.current?.click()}
      >
        {upload.isPending
          ? t("app.upload.uploading")
          : (label ?? t("app.upload.label"))}
      </button>
    </>
  );
}
