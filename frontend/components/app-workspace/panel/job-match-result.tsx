"use client";

import { useState } from "react";
import type { JobMatchData } from "@/lib/app-api/jobmatch.types";
import { ScoreBar } from "../score-bar";
import { JobRequirement } from "./job-requirement";
import { JobSkillConfirm } from "./job-skill-confirm";
import { MatchRing } from "./match-ring";
import styles from "../workspace-styles";

export function JobMatchResult({
  result,
  onAdd,
  openFixes,
}: {
  result: JobMatchData;
  onAdd: (skill: string) => boolean;
  openFixes: () => void;
}) {
  const [pendingSkill, setPendingSkill] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className={styles.pane}>
      <div className={styles.row}>
        <MatchRing score={result.score} />
        <div>
          <h3>{result.headline}</h3>
          <p>{result.summary}</p>
        </div>
      </div>
      {result.dimensions.map((dimension) => (
        <ScoreBar
          key={dimension.key}
          label={dimension.key}
          score={dimension.score}
        />
      ))}
      <h3 className={styles.eyebrow}>Requirements</h3>
      {result.requirements.map((requirement) => (
        <JobRequirement
          key={requirement.label}
          requirement={requirement}
          onAdd={setPendingSkill}
        />
      ))}
      {pendingSkill && (
        <JobSkillConfirm
          skill={pendingSkill}
          onConfirm={() => {
            if (!onAdd(pendingSkill)) {
              setError(
                "Skills section was not found, or the skill is already listed.",
              );
            }
            setPendingSkill(null);
          }}
          onCancel={() => setPendingSkill(null)}
        />
      )}
      {error && <p role="alert">{error}</p>}
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={openFixes}
        >
          Tailor my CV to this job
        </button>
        <button
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => setSaved(true)}
        >
          {saved ? "Job saved" : "Save this job"}
        </button>
      </div>
    </div>
  );
}
