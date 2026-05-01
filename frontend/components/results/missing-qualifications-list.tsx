import type { ComparisonResult } from "@/lib/types";

interface MissingQualificationsListProps {
  result: ComparisonResult;
}

type Severity = "critical" | "moderate" | "minor";

function getSeverity(index: number, total: number): Severity {
  if (total === 0) { return "minor"; }
  if (index < Math.ceil(total / 3)) { return "critical"; }
  if (index < Math.ceil((2 * total) / 3)) { return "moderate"; }
  return "minor";
}

const SEVERITY_STYLES: Record<
  Severity,
  { color: string; bg: string; border: string; label: string; icon: string }
> = {
  critical: { color: "#FF4FCB", bg: "bg-[#FF4FCB]/8", border: "border-[#FF4FCB]/20", label: "Critical", icon: "!" },
  moderate: { color: "#FF8C42", bg: "bg-[#FF8C42]/8", border: "border-[#FF8C42]/20", label: "Moderate", icon: "△" },
  minor: { color: "#8B5CF6", bg: "bg-[#8B5CF6]/8", border: "border-[#8B5CF6]/20", label: "Minor", icon: "○" },
};

export function MissingQualificationsList({ result }: MissingQualificationsListProps) {
  const items = result.missing_experience;

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 md:p-8">
      <h2 className="font-display font-extrabold text-lg text-[#F5F2D8] mb-6">Missing Qualifications</h2>

      {items.length === 0 ? (
        <div className="flex items-center gap-3 p-4 bg-[#CAFF43]/8 border border-[#CAFF43]/20 rounded-xl">
          <span className="text-[#CAFF43] text-lg">✦</span>
          <p className="text-sm font-bold text-[#CAFF43]">Your CV meets all listed qualifications for this role.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const severity = getSeverity(index, items.length);
            const s = SEVERITY_STYLES[severity];
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 ${s.bg} border ${s.border} rounded-xl`}
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                  style={{ color: s.color, backgroundColor: `${s.color}20` }}
                >
                  {s.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#F5F2D8]">{item}</p>
                  <span
                    className="text-xs font-extrabold uppercase tracking-wider mt-1 inline-block"
                    style={{ color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
