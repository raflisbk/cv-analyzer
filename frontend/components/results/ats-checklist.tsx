/**
 * ATS compatibility checklist — Mathical design system.
 */

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { AtsCheck } from "@/lib/types";

interface AtsChecklistProps {
  checks: AtsCheck[];
}

function getStatusStyle(status: AtsCheck["status"]) {
  if (status === "pass") {
    return {
      icon: <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "#CAFF43" }} />,
      pillBg: "bg-[#CAFF43]/10",
      pillText: "text-[#CAFF43]",
      label: "Pass",
      border: "border-[#CAFF43]/15",
    };
  }
  if (status === "warn") {
    return {
      icon: <AlertTriangle className="h-4 w-4 flex-shrink-0" style={{ color: "#FF8C42" }} />,
      pillBg: "bg-[#FF8C42]/10",
      pillText: "text-[#FF8C42]",
      label: "Review",
      border: "border-[#FF8C42]/15",
    };
  }
  return {
    icon: <XCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#FF4FCB" }} />,
    pillBg: "bg-[#FF4FCB]/10",
    pillText: "text-[#FF4FCB]",
    label: "Fix",
    border: "border-[#FF4FCB]/15",
  };
}

type AtsCountSummary = { passed: number; warned: number; failed: number };

function getAtsCountSummary(checks: AtsCheck[]): AtsCountSummary {
  return {
    passed: checks.filter((c) => c.status === "pass").length,
    warned: checks.filter((c) => c.status === "warn").length,
    failed: checks.filter((c) => c.status === "fail").length,
  };
}

export function AtsChecklist({ checks }: AtsChecklistProps) {
  if (checks.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <p className="font-display font-extrabold text-base text-[#F5F2D8]">ATS checks unavailable</p>
        <p className="text-sm text-[#F5F2D8]/40">ATS analysis could not be completed for this CV.</p>
      </div>
    );
  }

  const { passed, warned, failed } = getAtsCountSummary(checks);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex gap-3 flex-wrap">
        <span className="rounded-full bg-[#CAFF43]/10 text-[#CAFF43] text-xs font-bold px-3 py-1">
          ✓ {passed} passed
        </span>
        {warned > 0 && (
          <span className="rounded-full bg-[#FF8C42]/10 text-[#FF8C42] text-xs font-bold px-3 py-1">
            ⚠ {warned} to review
          </span>
        )}
        {failed > 0 && (
          <span className="rounded-full bg-[#FF4FCB]/10 text-[#FF4FCB] text-xs font-bold px-3 py-1">
            ✕ {failed} to fix
          </span>
        )}
      </div>

      {/* Check rows */}
      <div className="space-y-2">
        {checks.map((check, index) => {
          const style = getStatusStyle(check.status);
          return (
            <div
              key={index}
              className={`flex items-start justify-between gap-4 rounded-xl bg-[#1C1C1C] border ${style.border} px-4 py-3`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {style.icon}
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm text-[#F5F2D8]">{check.check}</p>
                  {check.detail && check.status !== "pass" && (
                    <p className="text-xs text-[#F5F2D8]/40">{check.detail}</p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 rounded-full text-[10px] font-extrabold px-2.5 py-0.5 ${style.pillBg} ${style.pillText}`}>
                {style.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
