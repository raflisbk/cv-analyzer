function getJobRouteSegment(jobId: string): string {
  const normalizedJobId = jobId.trim();

  if (!normalizedJobId) {
    throw new Error("jobId is required");
  }

  return encodeURIComponent(normalizedJobId);
}

export function getWorkspaceRoute(jobId: string): string {
  return `/workspace/${getJobRouteSegment(jobId)}`;
}

export function getResultsRoute(jobId: string): string {
  return `/results/${getJobRouteSegment(jobId)}`;
}
