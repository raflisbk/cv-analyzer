"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { matchJob } from "@/lib/app-api/jobmatch";
import { sampleJobDescription } from "@/lib/app-api/fixtures/jobmatch";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
import type { JobMatchData } from "@/lib/app-api/jobmatch.types";

export function useAppJobMatch(jobId: string) {
  const { t } = useT();
  const [description, setDescription] = useState(
    USE_APP_MOCKS ? sampleJobDescription : "",
  );
  const [result, setResult] = useState<JobMatchData | null>(null);
  const [error, setError] = useState("");
  async function runMatch() {
    if (description.trim().length < 50) {
      setError(t("errors.jobMatch.tooShort"));
      return;
    }
    try {
      setError("");
      setResult(await matchJob(jobId, description));
    } catch {
      setError(t("errors.jobMatch.failed"));
    }
  }
  return { description, setDescription, result, error, runMatch };
}
