/**
 * Tab navigation wrapper for results page per D-20, UI-SPEC §8
 * Uses shadcn Tabs (Radix Tabs wrapper).
 */

import { BarChart3, LayoutDashboard, SpellCheck, Sparkles } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { AnalysisResult } from "@/lib/types";
import { AtsChecklist } from "./ats-checklist";
import { GrammarIssuesList } from "./grammar-issues-list";
import { ScoreDashboard } from "./score-dashboard";
import { SkillsList } from "./skills-list";
import { SuggestionCards } from "./suggestion-cards";

interface ResultsTabsProps {
  result: AnalysisResult;
}

export function ResultsTabs({ result }: ResultsTabsProps) {
  return (
    // overflow-x-auto for mobile tab scrolling per UI-SPEC §11
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="overflow-x-auto flex w-full">
        {/* min-h-[44px] for touch target per UI-SPEC §2 */}
        <TabsTrigger
          value="overview"
          className="min-h-[44px] flex items-center gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="scores"
          className="min-h-[44px] flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Scores
        </TabsTrigger>
        <TabsTrigger
          value="skills"
          className="min-h-[44px] flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Skills
        </TabsTrigger>
        <TabsTrigger
          value="grammar"
          className="min-h-[44px] flex items-center gap-2"
        >
          <SpellCheck className="h-4 w-4" />
          Grammar
        </TabsTrigger>
      </TabsList>

      {/* Overview tab — ATS Checklist + AI Suggestions per UI-SPEC §7 C1 + Phase 3 */}
      <TabsContent value="overview" className="p-6 bg-secondary rounded-b-lg">
        <h2 className="text-xl font-semibold mb-4">ATS Compatibility Check</h2>
        <AtsChecklist checks={result.ats_checks} />
        {/* Phase 3: AI suggestions below ATS checklist (D-05) */}
        <SuggestionCards
          cards={result.suggestions}
          isLoading={result.status === "generating"}
        />
      </TabsContent>

      {/* Scores tab — 4 gauge charts per UI-SPEC §7 C2 */}
      <TabsContent value="scores" className="p-6 bg-secondary rounded-b-lg">
        <h2 className="text-xl font-semibold mb-4">Score Breakdown</h2>
        {result.scores ? (
          <ScoreDashboard scores={result.scores} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Scores not yet available.
          </p>
        )}
      </TabsContent>

      {/* Skills tab — badge cloud per UI-SPEC §7 C3 */}
      <TabsContent value="skills" className="p-6 bg-secondary rounded-b-lg">
        <h2 className="text-xl font-semibold mb-4">Extracted Skills</h2>
        <SkillsList skills={result.skills} />
      </TabsContent>

      {/* Grammar tab — issues list per UI-SPEC §7 C4 */}
      <TabsContent value="grammar" className="p-6 bg-secondary rounded-b-lg">
        <h2 className="text-xl font-semibold mb-4">Grammar &amp; Spelling</h2>
        <GrammarIssuesList issues={result.grammar_issues} />
      </TabsContent>
    </Tabs>
  );
}
