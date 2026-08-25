import { Circle, Sparkles, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComparisonResult } from "@/lib/types";

interface SkillsGapDisplayProps {
  result: ComparisonResult;
  partial?: string[];
}

type GroupType = "present" | "missing" | "partial";

const GROUP_STYLES: Record<
  GroupType,
  { color: string; bg: string; border: string; Icon: LucideIcon; label: string }
> = {
  present: {
    color: "#CAFF43",
    bg: "bg-[#CAFF43]/10",
    border: "border-[#CAFF43]/20",
    Icon: Sparkles,
    label: "Present",
  },
  missing: {
    color: "#FF4FCB",
    bg: "bg-[#FF4FCB]/10",
    border: "border-[#FF4FCB]/20",
    Icon: X,
    label: "Missing",
  },
  partial: {
    color: "#FF8C42",
    bg: "bg-[#FF8C42]/10",
    border: "border-[#FF8C42]/20",
    Icon: Circle,
    label: "Partial",
  },
};

interface SkillGroupProps {
  skills: string[];
  type: GroupType;
  emptyMessage: string;
}

function SkillGroup({ skills, type, emptyMessage }: SkillGroupProps) {
  const s = GROUP_STYLES[type];
  return (
    <div>
      <h3
        className="text-xs font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5"
        style={{ color: s.color }}
      >
        <s.Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {s.label} ({skills.length})
      </h3>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className={`${s.bg} ${s.border} border rounded-full px-3 py-1 text-sm font-bold`}
              style={{ color: s.color }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#F5F2D8]/40">{emptyMessage}</p>
      )}
    </div>
  );
}

export function SkillsGapDisplay({
  result,
  partial = [],
}: SkillsGapDisplayProps) {
  const present = result.matched_skills;
  const missing = result.missing_skills;

  return (
    <div className="border-y border-dashed border-white/15 bg-[#141414] p-6 md:p-8 space-y-6">
      <h2 className="font-display font-extrabold text-lg text-[#F5F2D8]">
        Skills Gap
      </h2>
      <SkillGroup
        skills={present}
        type="present"
        emptyMessage="No matching skills detected."
      />
      <SkillGroup
        skills={missing}
        type="missing"
        emptyMessage="No missing skills — your CV covers all required skills."
      />
      {partial.length > 0 && (
        <SkillGroup skills={partial} type="partial" emptyMessage="" />
      )}
    </div>
  );
}
