/**
 * Grammar and spelling issues list per UI-SPEC §7 C4, NLP-02, D-12
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GrammarIssue } from "@/lib/types";

interface GrammarIssuesListProps {
  issues: GrammarIssue[];
}

function getRuleClasses(rule: string): string {
  if (rule.includes("SPELLING")) { return "text-red-700 border-red-200"; }
  if (rule.includes("GRAMMAR")) { return "text-amber-700 border-amber-200"; }
  return "text-slate-600 border-slate-200";
}

export function GrammarIssuesList({ issues }: GrammarIssuesListProps) {
  const countLabel =
    issues.length === 0
      ? "No issues found"
      : issues.length === 1
        ? "1 issue found"
        : `${issues.length} issues found`;

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-base font-semibold text-foreground">
          No issues found
        </p>
        <p className="text-sm text-muted-foreground">
          Your CV text passed all grammar and spelling checks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{countLabel}</p>
      {issues.map((issue, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-2">
            {/* Rule badge per UI-SPEC §7 C4 */}
            <Badge
              variant="outline"
              className={`text-sm font-semibold uppercase tracking-wide ${getRuleClasses(issue.rule)}`}
            >
              {issue.rule}
            </Badge>
            {/* Issue text and suggestion */}
            <p className="text-base text-foreground">
              <span className="text-red-600">&ldquo;{issue.text}&rdquo;</span>
              {issue.suggestion && (
                <>
                  {" "}→{" "}
                  <span className="text-green-700 font-medium">
                    Suggestion: &ldquo;{issue.suggestion}&rdquo;
                  </span>
                </>
              )}
            </p>
            {/* Offset hint per UI-SPEC §5 */}
            <p className="text-sm text-muted-foreground">
              Near character {issue.offset}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
