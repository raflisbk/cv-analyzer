"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import styles from "../workspace-styles";

export function JobMatchActions({ openFixes }: { openFixes: () => void }) {
  const [saved, setSaved] = useState(false);
  const { t } = useT();
  return (
    <div className={styles.row}>
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={openFixes}
      >
        {t("appWorkspacePanel.match.tailor")}
      </button>
      <button
        type="button"
        className={`${styles.pill} ${styles.snow}`}
        onClick={() => setSaved(true)}
      >
        {saved
          ? t("appWorkspacePanel.match.saved")
          : t("appWorkspacePanel.match.save")}
      </button>
    </div>
  );
}
