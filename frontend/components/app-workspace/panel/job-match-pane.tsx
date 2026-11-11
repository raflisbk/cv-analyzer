"use client";

import { useState } from "react";
import Image from "next/image";
import HelpButton from "@/components/pathy/help-button";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import { matchJob } from "@/lib/app-api/jobmatch";
import { sampleJobDescription } from "@/lib/app-api/fixtures/jobmatch";
import type { JobMatchData } from "@/lib/app-api/jobmatch.types";
import { JobMatchResult } from "./job-match-result";
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
  const [description, setDescription] = useState(sampleJobDescription);
  const [result, setResult] = useState<JobMatchData | null>(null);
  const [error, setError] = useState("");
  async function runMatch() {
    if (!description.trim()) {
      setError("Paste a job description first.");
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
      <div className={styles.paneHead}>
        <Image
          className={styles.pathy}
          src={pathyPoseSrc("map")}
          alt=""
          width={72}
          height={72}
        />
        <div>
          <div className={styles.row}>
            <span className={styles.eyebrow}>Job match</span>
            <HelpButton helpKey="match" />
          </div>
          <h2>Paste a job, see the gap</h2>
          <p className={styles.muted}>
            Compare the job with your CV and see what is missing.
          </p>
        </div>
      </div>
      <label htmlFor="job-description">Job description</label>
      <textarea
        id="job-description"
        className={styles.textarea}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={runMatch}
      >
        Match with my CV
      </button>
      {error && <p role="alert">{error}</p>}
      {result && (
        <JobMatchResult result={result} onAdd={onAdd} openFixes={openFixes} />
      )}
    </div>
  );
}
