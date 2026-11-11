"use client";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceHydration, getJobFileUrl } from "@/lib/workspace";
import { getJobResults } from "@/lib/api";
import { getAts } from "@/lib/app-api/ats";
import { getGrammar } from "@/lib/app-api/grammar";
import { getVersions } from "@/lib/app-api/history";

export function useAppWorkspaceData(jobId: string) {
  const hydration = useQuery({
    queryKey: ["app-workspace", jobId],
    queryFn: () => getWorkspaceHydration(jobId),
  });
  const results = useQuery({
    queryKey: ["job-results", jobId],
    queryFn: () => getJobResults(jobId),
  });
  const file = useQuery({
    queryKey: ["app-file", jobId],
    queryFn: () => getJobFileUrl(jobId),
  });
  const ats = useQuery({
    queryKey: ["app-ats", jobId],
    queryFn: () => getAts(jobId),
  });
  const grammar = useQuery({
    queryKey: ["app-grammar", jobId],
    queryFn: () => getGrammar(jobId),
  });
  const history = useQuery({
    queryKey: ["app-history", jobId],
    queryFn: () => getVersions(jobId),
  });
  return { hydration, results, file, ats, grammar, history };
}
