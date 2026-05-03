

"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";

interface ResultsErrorProps {
  type: "failed" | "not-found" | "network" | "rate-limit";
  retryAfter?: number;
}

const ERROR_CONTENT: Record<
  ResultsErrorProps["type"],
  { heading: string; subtext: string; action: string | null }
> = {
  failed: {
    heading: "Analysis failed",
    subtext: "Something went wrong while analyzing your CV.",
    action: "Try Again",
  },
  "not-found": {
    heading: "Results not found",
    subtext: "This analysis may have expired or the link is invalid.",
    action: "Analyze a New CV",
  },
  network: {
    heading: "Unable to load results",
    subtext: "Check your connection and refresh the page.",
    action: "Refresh Page",
  },
  "rate-limit": {
    heading: "Too many requests",
    subtext:
      "You've reached the analysis limit. Please wait before trying again.",
    action: null,
  },
};

export function ResultsError({ type, retryAfter }: ResultsErrorProps) {
  const router = useRouter();
  const content = ERROR_CONTENT[type];

  const handleAction = () => {
    if (type === "network") {
      window.location.reload();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="bg-[#141414] rounded-[2rem] max-w-md mx-auto px-8 py-12 text-center">
      <div className="text-[#FF4FCB] mb-4 flex justify-center">
        <AlertCircle className="w-10 h-10" />
      </div>

      <h2 className="font-display font-extrabold text-xl text-[#F5F2D8] mb-2">
        {content.heading}
      </h2>

      <p className="text-sm text-[#F5F2D8]/60 mb-2">
        {content.subtext}
      </p>
      {type === "rate-limit" && retryAfter && (
        <p className="text-sm text-[#F5F2D8]/40 mb-6">
          Try again in {Math.ceil(retryAfter / 60)} minutes.
        </p>
      )}

      {content.action && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={handleAction}
            className="rounded-full bg-[#F5F2D8] text-[#141414] font-extrabold text-sm
                       px-6 py-3 hover:bg-white transition-colors duration-150"
          >
            {content.action}
          </button>
          <button
            onClick={handleAction}
            aria-label={content.action}
            className="w-12 h-12 rounded-full bg-[#CAFF43] flex items-center justify-center
                       hover:bg-[#CAFF43]/85 transition-colors duration-150 flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-[#141414]" />
          </button>
        </div>
      )}
    </div>
  );
}
