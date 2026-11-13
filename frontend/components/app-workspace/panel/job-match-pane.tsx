"use client";

import { useAppJobMatch } from "@/hooks/use-app-job-match";
import { JobMatchResult } from "./job-match-result";
import { JobMatchIntro } from "./job-match-intro";
import { JobMatchForm } from "./job-match-form";
import styles from "../workspace-styles";

export function JobMatchPane({
  jobId,
  onAdd,
  openFixes,
}: {
  jobId: string;
  onAdd: (skill: string) => boolean;
  openFixes: () => void;
}) {
  const { description, setDescription, result, error, runMatch } =
    useAppJobMatch(jobId);
  return (
    <div className={styles.pane}>
      <JobMatchIntro />
      <JobMatchForm
        description={description}
        setDescription={setDescription}
        runMatch={() => void runMatch()}
      />
      {error && <p role="alert">{error}</p>}
      {result && (
        <JobMatchResult result={result} onAdd={onAdd} openFixes={openFixes} />
      )}
    </div>
  );
}
