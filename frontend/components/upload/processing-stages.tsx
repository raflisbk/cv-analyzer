"use client";

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
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
  { id: "validating", label: "Validating quality" },
  { id: "complete", label: "Complete" },
];

export function ProcessingStages({ currentStage, percentage, message }: ProcessingStagesProps) {
  const currentStageIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <Card className="max-w-[600px] mx-auto p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Analyzing Your CV
      </h2>

      {/* Progress bar per UI-SPEC */}
      <Progress value={percentage} className="mb-6" />

      {/* Stage list per UI-SPEC section 5 */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isComplete =
            currentStage === "complete" ? true : index < currentStageIndex;
          const isPending =
            index > currentStageIndex && currentStage !== "complete";

          return (
            <div
              key={stage.id}
              className={cn(
                "flex items-center gap-3",
                isActive && !isComplete && "font-semibold text-slate-900",
                isComplete && "text-slate-400",
                isPending && "text-slate-400"
              )}
            >
              {/* Icon per UI-SPEC */}
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : isActive ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}

              <span className="text-base">{stage.label}</span>

              {isActive && !isComplete && (
                <span className="ml-auto text-sm text-blue-600">
                  {percentage}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current message per D-13, D-34 */}
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </Card>
  );
}
