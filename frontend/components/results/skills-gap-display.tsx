/**
 * SkillsGapDisplay — Badge clusters for present/missing/partial skills.
 * Per UI-SPEC §7.3 Badge Clusters, COMPARE-05, UX-01.
 * Partial group hidden entirely when partial.length === 0 (per UI-SPEC §7.3).
 */

import { Badge } from "@/components/ui/badge";
import type { ComparisonResult } from "@/lib/types";

interface SkillsGapDisplayProps {
  result: ComparisonResult;
  /** Optional partial matches — not in LLM output, passed from external analysis */
  partial?: string[];
}

export function SkillsGapDisplay({ result, partial = [] }: SkillsGapDisplayProps) {
  const present = result.matched_skills;
  const missing = result.missing_skills;

  return (
    <div className="space-y-6">
      {/* Section title per UI-SPEC §3 */}
      <h2 className="text-xl font-bold">Skills Gap</h2>

      {/* Present group — always shown even when empty */}
      <div>
        <h3 className="text-sm font-medium text-green-700 mb-2">
          ✅ Present ({present.length})
        </h3>
        {present.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {present.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-sm font-medium bg-green-50 text-green-700 border-green-200"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No matching skills detected.
          </p>
        )}
      </div>

      {/* Missing group — always shown even when empty */}
      <div>
        <h3 className="text-sm font-medium text-red-700 mb-2">
          ❌ Missing ({missing.length})
        </h3>
        {missing.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missing.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-sm font-medium bg-red-50 text-red-700 border-red-200"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No missing skills — your CV covers all required skills.
          </p>
        )}
      </div>

      {/* Partial group — HIDE ENTIRELY when count === 0 per UI-SPEC §7.3 */}
      {partial.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-amber-700 mb-2">
            ⚡ Partial ({partial.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {partial.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-sm font-medium bg-amber-50 text-amber-700 border-amber-200"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
