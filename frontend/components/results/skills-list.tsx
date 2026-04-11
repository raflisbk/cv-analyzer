/**
 * Skills badge cloud — Mathical cycling accent colors.
 */

interface SkillsListProps {
  skills: string[];
}

const PILL_STYLES = [
  "bg-[#CAFF43]/10 text-[#CAFF43] border border-[#CAFF43]/20",
  "bg-[#FF4FCB]/10 text-[#FF4FCB] border border-[#FF4FCB]/20",
  "bg-[#FF8C42]/10 text-[#FF8C42] border border-[#FF8C42]/20",
  "bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20",
];

export function SkillsList({ skills }: SkillsListProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <p className="font-display font-extrabold text-base text-[#F5F2D8]">No skills detected</p>
        <p className="text-sm text-[#F5F2D8]/40">
          Try uploading a CV with a dedicated Skills section listing technologies and tools.
        </p>
      </div>
    );
  }

  const countLabel = skills.length === 1 ? "1 skill extracted" : `${skills.length} skills extracted`;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest">{countLabel}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={skill}
            className={`rounded-full text-xs font-bold px-3 py-1.5 ${PILL_STYLES[i % PILL_STYLES.length]}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
