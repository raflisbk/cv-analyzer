export const processSteps = [
  { key: "upload", image: "cloud-upload" },
  { key: "read", image: "scanner" },
  { key: "score", image: "chart" },
  { key: "match", image: "target" },
  { key: "edit", image: "pencil" },
  { key: "export", image: "pdf-export" },
] as const;
export function processStepProgress(index: number, count: number) {
  return count > 1 ? Math.min(1, Math.max(0, index / (count - 1))) : 0;
}
