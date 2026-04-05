/**
 * ATS compatibility checklist per UI-SPEC §7 C1, NLP-03, D-13, D-14
 */

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AtsCheck } from "@/lib/types";

interface AtsChecklistProps {
  checks: AtsCheck[];
}

function getStatusIcon(status: AtsCheck["status"]) {
  if (status === "pass") {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  }
  if (status === "warn") {
    return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  }
  return <XCircle className="h-4 w-4 text-red-600" />;
}

function getStatusBadgeClasses(status: AtsCheck["status"]): string {
  if (status === "pass") { return "bg-green-50 text-green-700 border-green-200"; }
  if (status === "warn") { return "bg-amber-50 text-amber-700 border-amber-200"; }
  return "bg-red-50 text-red-700 border-red-200";
}

function getStatusLabel(status: AtsCheck["status"]): string {
  if (status === "pass") { return "Pass"; }
  if (status === "warn") { return "Review"; }
  return "Fix Required";
}

function getAtsCountSummary(checks: AtsCheck[]): string {
  const passed = checks.filter((c) => c.status === "pass").length;
  const warned = checks.filter((c) => c.status === "warn").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  return `${passed} passed · ${warned} to review · ${failed} to fix`;
}

export function AtsChecklist({ checks }: AtsChecklistProps) {
  if (checks.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-base font-semibold text-foreground">
          ATS checks unavailable
        </p>
        <p className="text-sm text-muted-foreground">
          ATS analysis could not be completed for this CV.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{getAtsCountSummary(checks)}</p>
      <div className="divide-y divide-slate-100">
        {checks.map((check, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-4 py-4"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {getStatusIcon(check.status)}
              <div className="space-y-1 min-w-0">
                <p className="text-base text-foreground">{check.check}</p>
                {check.detail && check.status !== "pass" && (
                  <p className="text-sm text-muted-foreground">{check.detail}</p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 ${getStatusBadgeClasses(check.status)}`}
            >
              {getStatusLabel(check.status)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
