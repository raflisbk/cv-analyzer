"use client";

import { useState } from "react";
import { matchJob } from "@/lib/app-api/jobmatch";
import { sampleJobDescription } from "@/lib/app-api/fixtures/jobmatch";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import type { JobMatchData } from "@/lib/app-api/jobmatch.types";
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
  const [description, setDescription] = useState(
    USE_APP_MOCKS ? sampleJobDescription : "",
  );
  const [result, setResult] = useState<JobMatchData | null>(null);
  const [error, setError] = useState("");
  async function runMatch() {
    if (description.trim().length < 50) {
      setError("Paste a job description of at least 50 characters.");
      return;
    }
    try {
      setError("");
      setResult(await matchJob(jobId, description));
    } catch {
      setError("Job match could not run. Try again.");
    }
  }
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
