import { Loader2 } from "lucide-react";

export default function ResultsLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2D8] py-12 px-4">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#141414]/40" />
        <p className="text-sm font-medium text-[#141414]/50">
          Loading analysis results...
        </p>
      </div>
    </main>
  );
}
