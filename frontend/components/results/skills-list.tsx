/**
 * Skills badge cloud per UI-SPEC §7 C3, NLP-04
 */

import { Badge } from "@/components/ui/badge";

interface SkillsListProps {
  skills: string[];
}

export function SkillsList({ skills }: SkillsListProps) {
  const countLabel =
    skills.length === 0
      ? "No skills detected"
      : skills.length === 1
        ? "1 skill extracted"
        : `${skills.length} skills extracted`;

  if (skills.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-base font-semibold text-foreground">
          No skills detected
        </p>
        <p className="text-sm text-muted-foreground">
          Try uploading a CV with a dedicated Skills section listing technologies
          and tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{countLabel}</p>
      {/* Badge cloud per UI-SPEC §7 C3 */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
