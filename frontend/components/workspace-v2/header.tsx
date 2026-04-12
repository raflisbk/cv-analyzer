"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceV2HeaderProps {
  filename: string | null;
  jobId: string;
  jobStatus?: "preparing" | "ready" | "failed";
  className?: string;
}

export function WorkspaceV2Header({
  filename,
  jobId,
  jobStatus,
  className,
}: WorkspaceV2HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "flex items-center gap-3 px-4 bg-[--ws-bg]",
        className
      )}
    >
      {/* Tombol Kembali */}
      <button
        onClick={() => router.push(`/results/${jobId}`)}
        className="flex h-8 items-center gap-1 px-2 text-sm font-normal text-[--ws-ink-secondary] transition-colors duration-150 hover:text-[--ws-ink]"
        aria-label="Kembali ke halaman hasil"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Kembali</span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-[--ws-border-strong]" aria-hidden="true" />

      {/* Filename */}
      <p
        className="min-w-0 flex-1 truncate text-sm font-normal text-[--ws-ink]"
        style={{ maxWidth: "360px" }}
      >
        {filename ?? "Dokumen"}
      </p>

      {/* Job status pill — hanya tampil jika status ready (completed) */}
      {jobStatus === "ready" && (
        <span
          className="flex-none rounded-full bg-[--ws-accent-muted] px-2 py-0.5 text-xs font-bold text-[--ws-accent]"
          aria-label="Status: Selesai"
        >
          Selesai
        </span>
      )}
    </header>
  );
}
