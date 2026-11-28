"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import ArtifactPanelBody from "./artifact-panel-body";
import { useNarrowViewport } from "./use-narrow-viewport";
import styles from "./artifact.module.css";

export default function ArtifactPanel({
  jobId,
  close,
}: {
  jobId: string;
  close: () => void;
}) {
  const { t } = useT();
  const ref = useRef<HTMLElement>(null);
  const sheet = useNarrowViewport();
  useAppShellFocusTrap(sheet, ref, close);
  return (
    <>
      {sheet && (
        <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      )}
      <aside
        ref={ref}
        className={styles.panel}
        data-sheet={sheet}
        role={sheet ? "dialog" : undefined}
        aria-modal={sheet ? true : undefined}
        aria-label={t("app.chat.panelLabel")}
      >
        <header>
          <h3>{t("app.chat.artifactTitle")}</h3>
          <button
            type="button"
            className={styles.close}
            aria-label={t("app.chat.panelClose")}
            onClick={close}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <ArtifactPanelBody jobId={jobId} />
      </aside>
    </>
  );
}
