import { Suspense } from "react";
import { WorkspacePage } from "@/components/app-workspace/workspace-page";

export default async function Page({
  params,
}: {
  params: Promise<{ job_id: string }>;
}) {
  const { job_id } = await params;
  return (
    <Suspense fallback={<div role="status">Loading workspace…</div>}>
      <WorkspacePage jobId={job_id} />
    </Suspense>
  );
}
