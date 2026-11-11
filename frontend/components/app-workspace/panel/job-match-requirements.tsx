"use client";

import { useState } from "react";
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
  const [pendingSkill, setPendingSkill] = useState<string | null>(null);
  const [error, setError] = useState("");
  function confirm() {
    if (pendingSkill && !onAdd(pendingSkill)) {
      setError("Skills section was not found, or the skill is already listed.");
    }
    setPendingSkill(null);
  }
  return (
    <>
      <h3 className={styles.eyebrow}>Requirements</h3>
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
