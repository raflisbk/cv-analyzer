"use client";

import { useEffect, useState } from "react";
import { useJobStream } from "@/hooks/use-job-stream";
import { useJobResults } from "@/hooks/use-job-results";
import { useT } from "@/components/i18n/i18n-provider";
import { usePathy } from "@/components/pathy/pathy-context";
import { useAppShellScoreCount } from "./use-app-shell-score-count";

const stages: Record<string, number> = {
  extracting: 0,
  parsing: 0,
  analyzing: 1,
  scoring: 2,
  grammar: 3,
  generating: 4,
  suggesting: 4,
  complete: 5,
};

export function useAppShellAnalysisProgress(
  jobId: string,
  onComplete?: () => void,
) {
  const [complete, setComplete] = useState(false);
  const { progress, error } = useJobStream(jobId, {
    onComplete: () => {
      setComplete(true);
      onComplete?.();
    },
  });
  const result = useJobResults(complete ? jobId : null);
  const pathy = usePathy();
  const { t } = useT();
  const score = result.data?.scores?.overall ?? 0;
  const count = useAppShellScoreCount(complete, score);
  useEffect(() => {
    pathy.react("running", t("pathy.ui.readingBubble"));
  }, [jobId, pathy, t]);
  useEffect(() => {
    if (complete) {
      pathy.react("trophy", t("pathy.ui.scoreReadyBubble"));
    }
  }, [complete, pathy, t]);
  return {
    active: stages[progress?.stage ?? "extracting"] ?? 0,
    message: progress?.message,
    failed: Boolean(error || progress?.stage === "failed" || result.isError),
    complete: Boolean(complete && result.data?.scores),
    count,
  };
}
