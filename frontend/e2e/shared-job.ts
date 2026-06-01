import { uploadCV, waitForJobComplete, apiUrl } from "./helpers";

let _cachedJobId: string | null = null;
let _cachedReady = false;
let _initPromise: Promise<{ jobId: string | null; ready: boolean }> | null =
  null;

const KNOWN_COMPLETED_JOBS = [
  "458ffc83-8fa9-49b6-bc14-4e25c6f3ffb1",
  "01b9da1b-f936-418c-a092-d8eafd18ff79",
  "0d2fd06f-186d-459f-9fc6-fb45c1eea59f",
  "f23027ea-05fd-4b7b-8ba5-9f01191da7bc",
];

async function findCompletedJob(): Promise<string | null> {
  for (const jobId of KNOWN_COMPLETED_JOBS) {
    try {
      const resp = await fetch(apiUrl(`/jobs/${jobId}/results`));
      if (resp.ok) {
        const body = await resp.json();
        const status = body?.data?.status;
        if (status === "complete" || status === "complete_partial") {
          return jobId;
        }
      }
    } catch {
      // continue to next
    }
  }
  return null;
}

export async function getSharedJob(): Promise<{
  jobId: string | null;
  ready: boolean;
}> {
  if (_cachedJobId !== null && _cachedReady) {
    return { jobId: _cachedJobId, ready: _cachedReady };
  }

  if (!_initPromise) {
    _initPromise = (async () => {
      // First try a known-completed job (avoids Celery queue backlog)
      const existing = await findCompletedJob();
      if (existing) {
        _cachedJobId = existing;
        _cachedReady = true;
        return { jobId: _cachedJobId, ready: _cachedReady };
      }

      // Fallback: upload fresh CV and wait
      const jobId = await uploadCV();
      if (jobId) {
        const ready = await waitForJobComplete(jobId, 300);
        _cachedJobId = jobId;
        _cachedReady = ready;
      }
      return { jobId: _cachedJobId, ready: _cachedReady };
    })();
  }

  return _initPromise;
}
