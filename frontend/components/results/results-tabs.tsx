

import { ArrowLeftRight, BarChart3, LayoutDashboard, SpellCheck, Sparkles } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { AnalysisResult, JobRole } from "@/lib/types";
import { AtsChecklist } from "./ats-checklist";
import { CompareTab } from "./compare-tab";
import { ComparisonSkeleton } from "./comparison-skeleton";
import { GrammarIssuesList } from "./grammar-issues-list";
import { MatchScoreCard } from "./match-score-card";
import { MissingQualificationsList } from "./missing-qualifications-list";
import { ScoreDashboard } from "./score-dashboard";
import { SkillsGapDisplay } from "./skills-gap-display";
import { SkillsList } from "./skills-list";
import { SuggestionCards } from "./suggestion-cards";

interface ResultsTabsProps {
  result: AnalysisResult;
  jobRoles?: JobRole[];
  onCompareComplete?: () => void;
}

export function ResultsTabs({ result, jobRoles = [], onCompareComplete }: ResultsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="overflow-x-auto flex w-full bg-[#F5F2D8] border-b border-[#141414]/10 mb-2">
        <TabsTrigger
          value="overview"
          className="min-h-[44px] flex items-center gap-2 text-[#141414]/50 hover:text-[#141414]/80 data-[state=active]:text-[#141414] data-[state=active]:border-b-2 data-[state=active]:border-[#CAFF43] data-[state=active]:font-extrabold"
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="scores"
          className="min-h-[44px] flex items-center gap-2 text-[#141414]/50 hover:text-[#141414]/80 data-[state=active]:text-[#141414] data-[state=active]:border-b-2 data-[state=active]:border-[#CAFF43] data-[state=active]:font-extrabold"
        >
          <BarChart3 className="h-4 w-4" />
          Scores
        </TabsTrigger>
        <TabsTrigger
          value="skills"
          className="min-h-[44px] flex items-center gap-2 text-[#141414]/50 hover:text-[#141414]/80 data-[state=active]:text-[#141414] data-[state=active]:border-b-2 data-[state=active]:border-[#CAFF43] data-[state=active]:font-extrabold"
        >
          <Sparkles className="h-4 w-4" />
          Skills
        </TabsTrigger>
        <TabsTrigger
          value="grammar"
          className="min-h-[44px] flex items-center gap-2 text-[#141414]/50 hover:text-[#141414]/80 data-[state=active]:text-[#141414] data-[state=active]:border-b-2 data-[state=active]:border-[#CAFF43] data-[state=active]:font-extrabold"
        >
          <SpellCheck className="h-4 w-4" />
          Grammar
        </TabsTrigger>
        <TabsTrigger
          value="compare"
          className="min-h-[44px] flex items-center gap-2 text-[#141414]/50 hover:text-[#141414]/80 data-[state=active]:text-[#141414] data-[state=active]:border-b-2 data-[state=active]:border-[#CAFF43] data-[state=active]:font-extrabold"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Compare
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="pt-6 space-y-6 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
        <h2 className="font-display font-extrabold text-lg text-[#141414]">ATS Compatibility Check</h2>
        <AtsChecklist checks={result.ats_checks} />
        <SuggestionCards
          cards={result.suggestions}
          isLoading={result.status !== "complete" && result.status !== "failed"}
        />
      </TabsContent>

      <TabsContent value="scores" className="pt-6 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
        <h2 className="font-display font-extrabold text-lg text-[#141414]">Score Breakdown</h2>
        {result.scores ? (
          <ScoreDashboard scores={result.scores} />
        ) : (
          <p className="text-sm text-[#141414]/50">
            Scores not yet available.
          </p>
        )}
      </TabsContent>

      <TabsContent value="skills" className="pt-6 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
        <h2 className="font-display font-extrabold text-lg text-[#141414]">Extracted Skills</h2>
        <SkillsList skills={result.skills} />
      </TabsContent>

      <TabsContent value="grammar" className="pt-6 space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
        <h2 className="font-display font-extrabold text-lg text-[#141414]">Grammar &amp; Spelling</h2>
        <GrammarIssuesList issues={result.grammar_issues} />
      </TabsContent>

      <TabsContent value="compare" className="pt-6 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200">
        <CompareTab
          jobId={result.job_id}
          jobRoles={jobRoles}
          comparisonResult={result.comparison_result}
          comparisonStatus={result.comparison_status}
          onCompareComplete={onCompareComplete}
        >
          {result.comparison_status === "pending" || result.comparison_status === "comparing" ? (
            <ComparisonSkeleton />
          ) : result.comparison_status === "complete" && result.comparison_result ? (
            <div className="space-y-6">
              <MatchScoreCard result={result.comparison_result} />
              <SkillsGapDisplay result={result.comparison_result} />
              <MissingQualificationsList result={result.comparison_result} />
            </div>
          ) : null}
        </CompareTab>
      </TabsContent>
    </Tabs>
  );
}
