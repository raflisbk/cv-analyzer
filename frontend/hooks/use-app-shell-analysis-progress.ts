"use client";

import { useEffect, useState } from "react";
import { useJobStream } from "@/hooks/use-job-stream";
import { useJobResults } from "@/hooks/use-job-results";
import { useT } from "@/components/i18n/i18n-provider";
import { usePathy } from "@/components/pathy/pathy-context";
import { stageMessageKey } from "@/lib/upload/stage";
import { useAppShellScoreCount } from "./use-app-shell-score-count";

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
    active: progress?.step ?? 0,
    message: progress
      ? t(`upload.stages.${stageMessageKey(progress.stage)}`, {
          done: progress.done ?? 0,
          total: progress.total ?? 0,
        })
      : undefined,
    failed: Boolean(error || progress?.stage === "failed" || result.isError),
    complete: Boolean(complete && result.data?.scores),
    count,
  };
}
