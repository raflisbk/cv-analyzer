/**
 * MissingQualificationsList — Ordered list of missing experience items with severity icons.
 * Per UI-SPEC §7.4, COMPARE-06.
 * Severity assigned by position: first third=critical, mid third=moderate, rest=minor.
 */

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ComparisonResult } from "@/lib/types";

interface MissingQualificationsListProps {
  result: ComparisonResult;
}

type Severity = "critical" | "moderate" | "minor";

/** Assign severity by position in list: first third=critical, mid third=moderate, rest=minor */
function getSeverity(index: number, total: number): Severity {
  if (total === 0) { return "minor"; }
  if (index < Math.ceil(total / 3)) { return "critical"; }
  if (index < Math.ceil((2 * total) / 3)) { return "moderate"; }
  return "minor";
}

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "critical") {
    return <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />;
  }
  if (severity === "moderate") {
    return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
  }
  return <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />;
}

function severityLabel(severity: Severity): { text: string; className: string } {
  if (severity === "critical") {
    return { text: "Critical", className: "text-sm font-medium text-red-500" };
  }
  if (severity === "moderate") {
    return { text: "Moderate", className: "text-sm font-medium text-amber-500" };
  }
  return { text: "Minor", className: "text-sm font-medium text-slate-400" };
}

export function MissingQualificationsList({ result }: MissingQualificationsListProps) {
  const items = result.missing_experience;

  return (
    <div>
      {/* Section title per UI-SPEC §3 */}
      <h2 className="text-xl font-bold mb-4">Missing Qualifications</h2>

      {items.length === 0 ? (
        <p className="text-base font-medium text-muted-foreground">
          Your CV meets all listed qualifications for this role.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, index) => {
            const severity = getSeverity(index, items.length);
            const { text: severityText, className: severityClass } = severityLabel(severity);
            return (
              <div key={index} className="flex items-start gap-2">
                <SeverityIcon severity={severity} />
                <div className="flex flex-col gap-2">
                  <span className="text-base font-medium text-foreground">{item}</span>
                  <span className={severityClass}>{severityText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
