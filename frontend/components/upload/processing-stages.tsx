"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/i18n-provider";
import { toUiStage } from "@/lib/upload/stage";

interface ProcessingStagesProps {
  currentStage: string;
  percentage: number;
  message: string;
}

const stages = [
  { id: "uploading", color: "#FF8C42" },
  { id: "extracting", color: "#CAFF43" },
  { id: "analyzing", color: "#8B5CF6" },
  { id: "generating", color: "#FF4FCB" },
  { id: "comparing", color: "#CAFF43" },
  { id: "complete", color: "#CAFF43" },
];

export function ProcessingStages({
  currentStage,
  percentage,
  message,
}: ProcessingStagesProps) {
  const { t } = useT();
  const uiStage = toUiStage(currentStage);
  const currentStageIndex = stages.findIndex((s) => s.id === uiStage);
  const activeStage = stages[Math.max(0, currentStageIndex)];

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="font-display font-extrabold text-xl text-[#F5F2D8] mb-1">
          {t("upload.stages.title")}
        </h2>
        <p className="text-sm text-[#F5F2D8]/40">{message}</p>
      </div>

      <div className="w-full h-2.5 rounded-full bg-[#F5F2D8]/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: activeStage?.color ?? "#CAFF43",
          }}
        />
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isActive = stage.id === uiStage;
          const isComplete =
            uiStage === "complete" ? true : index < currentStageIndex;
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

              <span
                className={cn(
                  "text-sm flex-1",
                  isActive && "font-extrabold text-[#F5F2D8]",
                  isComplete && "text-[#F5F2D8]/40",
                  isPending && "text-[#F5F2D8]/25",
                )}
              >
                {t(`upload.stages.${stage.id}`)}
              </span>

              {isActive && (
                <span
                  className="text-xs font-bold rounded-full px-2.5 py-0.5"
                  style={{
                    backgroundColor: `${stage.color}20`,
                    color: stage.color,
                  }}
                >
                  {percentage}%
                </span>
              )}
              {isComplete && (
                <span className="text-xs font-bold text-[#F5F2D8]/25">
                  {t("upload.stages.done")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
