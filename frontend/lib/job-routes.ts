function getJobRouteSegment(jobId: string): string {
  const normalizedJobId = jobId.trim();

  if (!normalizedJobId) {
    throw new Error("jobId is required");
  }

  return encodeURIComponent(normalizedJobId);
}

export function getWorkspaceRoute(jobId: string): string {
  // Phase 17 cutover: redirect to /workspace-v2 instead of /workspace
  // Old route: return `/workspace/${getJobRouteSegment(jobId)}`;
  return `/workspace-v2/${getJobRouteSegment(jobId)}`;
}

export function getResultsRoute(jobId: string): string {
  return `/results/${getJobRouteSegment(jobId)}`;
}
