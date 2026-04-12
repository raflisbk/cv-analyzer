// WorkspaceSkeleton akan dibuat di Plan 05 — untuk sekarang gunakan div placeholder
export default function WorkspaceV2Loading() {
  return (
    <div
      data-workspace-v2
      className="flex h-screen flex-col items-center justify-center bg-[#111111]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="animate-pulse text-sm text-[rgba(245,242,216,0.35)]">
        Memuat ruang kerja...
      </div>
    </div>
  );
}
