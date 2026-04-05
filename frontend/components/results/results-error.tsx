/**
 * Unified error state display for results page per UI-SPEC §5 "Error states", §7 D
 */

"use client";

import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ResultsErrorProps {
  type: "failed" | "not-found" | "network" | "rate-limit";
  retryAfter?: number; // seconds, for rate-limit type
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
    <div className="max-w-md mx-auto mt-16">
      <Alert variant="destructive">
        <AlertTitle className="text-base font-semibold">
          {content.heading}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{content.subtext}</p>
          {type === "rate-limit" && retryAfter && (
            <p className="text-sm">
              Try again in {Math.ceil(retryAfter / 60)} minutes.
            </p>
          )}
          {content.action && (
            <Button
              variant="outline"
              onClick={handleAction}
              className="w-full mt-2"
            >
              {content.action}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
