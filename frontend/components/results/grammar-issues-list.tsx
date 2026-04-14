/**
 * Grammar issues list — Mathical dark cards.
 */

import type { GrammarIssue } from "@/lib/types";

interface GrammarIssuesListProps {
  issues: GrammarIssue[];
}

function getRuleStyle(rule: string): { pillBg: string; pillText: string } {
  if (rule.includes("SPELLING")) { return { pillBg: "bg-[#FF4FCB]/10", pillText: "text-[#FF4FCB]" }; }
  if (rule.includes("GRAMMAR"))  { return { pillBg: "bg-[#FF8C42]/10", pillText: "text-[#FF8C42]" }; }
  return { pillBg: "bg-[#8B5CF6]/10", pillText: "text-[#8B5CF6]" };
}

export function GrammarIssuesList({ issues }: GrammarIssuesListProps) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <p className="font-display font-extrabold text-base text-[#F5F2D8]">No issues found ✓</p>
        <p className="text-sm text-[#F5F2D8]/40">Your CV text passed all grammar and spelling checks.</p>
      </div>
    );
  }

  const countLabel = issues.length === 1 ? "1 issue found" : `${issues.length} issues found`;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest">{countLabel}</p>
      {issues.map((issue, index) => {
        const { pillBg, pillText } = getRuleStyle(issue.rule);
        return (
          <div key={index} className="bg-[#F5F2D8]/[0.03] backdrop-blur-sm rounded-2xl border border-[#F5F2D8]/[0.08] p-5 space-y-2">
            <span className={`inline-block rounded-full text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 ${pillBg} ${pillText}`}>
              {issue.rule}
            </span>
            <p className="text-sm text-[#F5F2D8] leading-relaxed">
              <span className="text-[#FF4FCB] font-semibold">&ldquo;{issue.text}&rdquo;</span>
              {issue.suggestion && (
                <>
                  {" → "}
                  <span className="text-[#CAFF43] font-semibold">&ldquo;{issue.suggestion}&rdquo;</span>
                </>
              )}
            </p>
            <p className="text-xs text-[#F5F2D8]/30">Near character {issue.offset}</p>
          </div>
        );
      })}
    </div>
  );
}
