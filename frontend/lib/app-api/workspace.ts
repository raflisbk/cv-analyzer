export { getWorkspaceHydration, getJobFileUrl } from "@/lib/workspace";
export { getJobResults } from "@/lib/api";
import { apiFetch } from "@/lib/api";

export async function requestInlineRewrite(
  jobId: string,
  selectedText: string,
  instruction: string,
): Promise<string> {
  const data = await apiFetch<{ rewrittenText: string }>(
    `/jobs/${jobId}/inline-edit`,
    {
      method: "POST",
      body: JSON.stringify({
        selectedText,
        prompt: instruction,
        cvContext: null,
      }),
    },
  );
  return data.rewrittenText;
}
