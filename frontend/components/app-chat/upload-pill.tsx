"use client";

import { Plus } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import { useAppShellUploadButton } from "@/hooks/use-app-shell-upload-button";
import styles from "./composer.module.css";

export default function UploadPill({
  onUploaded,
}: {
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
        className={styles.pill}
        type="button"
        disabled={upload.isPending}
        onClick={() => input.current?.click()}
      >
        <Plus size={15} aria-hidden="true" />
        {upload.isPending ? t("app.upload.uploading") : t("app.chat.upload")}
      </button>
    </>
  );
}
