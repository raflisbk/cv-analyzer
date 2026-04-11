"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStagesProps {
  currentStage: string;
  percentage: number;
  message: string;
}

const stages = [
  { id: "uploading",   label: "Uploading",                    color: "#FF8C42" },
  { id: "extracting",  label: "Extracting text",              color: "#CAFF43" },
  { id: "analyzing",   label: "Analyzing content",            color: "#8B5CF6" },
  { id: "generating",  label: "Generating suggestions",       color: "#FF4FCB" },
  { id: "comparing",   label: "Comparing against job role",   color: "#CAFF43" },
  { id: "complete",    label: "Complete",                     color: "#CAFF43" },
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
  grammar_check: "analyzing",
  generating_suggestions: "generating",
  comparing_job: "comparing",
  complete: "complete",
};

function toUiStage(backendStage: string): string {
  return STAGE_MAP[backendStage] ?? "uploading";
}

export function ProcessingStages({ currentStage, percentage, message }: ProcessingStagesProps) {
  const uiStage = toUiStage(currentStage);
  const currentStageIndex = stages.findIndex((s) => s.id === uiStage);
  const activeStage = stages[Math.max(0, currentStageIndex)];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-xl text-[#F5F2D8] mb-1">
          Analyzing your CV
        </h2>
        <p className="text-sm text-[#F5F2D8]/40">{message}</p>
      </div>

      {/* Progress bar — color matches active stage */}
      <div className="w-full h-2.5 rounded-full bg-[#F5F2D8]/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: activeStage?.color ?? "#CAFF43" }}
        />
      </div>

      {/* Stage list */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isActive = stage.id === uiStage;
          const isComplete = uiStage === "complete" ? true : index < currentStageIndex;
          const isPending = !isActive && !isComplete;

          return (
            <div key={stage.id} className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: stage.color }}
                />
              ) : isActive ? (
                <Loader2
                  className="w-5 h-5 flex-shrink-0 animate-spin"
                  style={{ color: stage.color }}
                />
              ) : (
                <Circle className="w-5 h-5 flex-shrink-0 text-[#F5F2D8]/20" />
              )}

              <span className={cn(
                "text-sm flex-1",
                isActive   && "font-extrabold text-[#F5F2D8]",
                isComplete && "text-[#F5F2D8]/40",
                isPending  && "text-[#F5F2D8]/25"
              )}>
                {stage.label}
              </span>

              {isActive && (
                <span
                  className="text-xs font-bold rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                >
                  {percentage}%
                </span>
              )}
              {isComplete && (
                <span className="text-xs font-bold text-[#F5F2D8]/25">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


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

