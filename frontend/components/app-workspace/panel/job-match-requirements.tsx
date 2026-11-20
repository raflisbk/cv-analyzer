"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import type { JobMatchData } from "@/lib/app-api/jobmatch.types";
import { JobRequirement } from "./job-requirement";
import { JobSkillConfirm } from "./job-skill-confirm";
import styles from "../workspace-styles";

export function JobMatchRequirements({
  requirements,
  onAdd,
}: {
  requirements: JobMatchData["requirements"];
  onAdd: (skill: string) => boolean;
}) {
  const { t } = useT();
  const [pendingSkill, setPendingSkill] = useState<string | null>(null);
  const [error, setError] = useState("");
  function confirm() {
    if (pendingSkill && !onAdd(pendingSkill)) {
      setError(t("appWorkspacePanel.match.skillsMissing"));
    }
    setPendingSkill(null);
  }
  return (
    <>
      <h3 className={styles.eyebrow}>
        {t("appWorkspacePanel.match.requirements")}
      </h3>
      {requirements.map((requirement) => (
        <JobRequirement
          key={requirement.label}
          requirement={requirement}
          onAdd={setPendingSkill}
        />
      ))}
      {pendingSkill && (
        <JobSkillConfirm
          skill={pendingSkill}
          onConfirm={confirm}
          onCancel={() => setPendingSkill(null)}
        />
      )}
      {error && <p role="alert">{error}</p>}
    </>
  );
}
