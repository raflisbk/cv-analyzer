"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStagesProps {
  currentStage: string;
  percentage: number;
  message: string;
}

const stages = [
  { id: "uploading", label: "Uploading" },
  { id: "extracting", label: "Extracting text" },
  { id: "analyzing", label: "Analyzing content" },
  { id: "generating", label: "Generating suggestions" }, // Phase 3 (D-19)
  { id: "comparing", label: "Comparing against job description" }, // Phase 4 (D-C2, UI-SPEC §5)
  { id: "complete", label: "Complete" },
];

// Map all backend stage names → UI stage id
const STAGE_MAP: Record<string, string> = {
  uploading: "uploading",
  extracting: "extracting",
  validating: "extracting",
  parsing: "extracting",
  analyzing_sections: "analyzing",
  extracting_skills: "analyzing",
  scoring: "analyzing",
  grammar_check: "analyzing", // Phase 2: was missing from STAGE_MAP
  generating_suggestions: "generating", // Phase 3: LLM suggestion stage (D-19)
  comparing_job: "comparing",           // Phase 4: CV vs JD comparison stage (D-C2, D-C13)
  complete: "complete",
};

function toUiStage(backendStage: string): string {
  return STAGE_MAP[backendStage] ?? "uploading";
}

export function ProcessingStages({ currentStage, percentage, message }: ProcessingStagesProps) {
  const uiStage = toUiStage(currentStage);
  const currentStageIndex = stages.findIndex((s) => s.id === uiStage);

  return (
    <div className="w-full space-y-5">
      <h2 className="font-display font-extrabold text-lg text-[#F5F2D8]">
        Analyzing Your CV
      </h2>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-[#F5F2D8]/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#CAFF43] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-2.5">
        {stages.map((stage, index) => {
          const isActive = stage.id === uiStage;
          const isComplete =
            uiStage === "complete" ? true : index < currentStageIndex;
          const isPending =
            index > currentStageIndex && uiStage !== "complete";

          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center gap-3",
                isActive && !isComplete && "text-[#F5F2D8]",
                isComplete && "text-[#F5F2D8]/40",
                isPending && "text-[#F5F2D8]/25"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-[#CAFF43] flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-[#CAFF43] animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 flex-shrink-0" />
              )}

              <span className={cn("text-sm", isActive && !isComplete && "font-extrabold")}>
                {stage.label}
              </span>

              {isActive && !isComplete && (
                <span className="ml-auto text-xs font-bold text-[#CAFF43]">
                  {percentage}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#F5F2D8]/40">{message}</p>
    </div>
  );
}

