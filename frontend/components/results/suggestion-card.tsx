/**
 * SuggestionCardItem — renders one suggestion card for a CV section.
 * SuggestionItemRow — internal component for a single suggestion row.
 * Per UI-SPEC Phase 3 §6 sections B and C.
 */
"use client";

import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type {
  SuggestionCard,
  SuggestionItem,
  SuggestionPriority,
  SuggestionType,
} from "@/lib/types";

function getPriorityBadgeClasses(priority: SuggestionPriority): string {
  if (priority === "high_impact") {
    return "bg-amber-50 text-amber-700 border-amber-200 shrink-0";
  }
  return "bg-sky-50 text-sky-700 border-sky-200 shrink-0";
}

function getTypeIcon(type: SuggestionType) {
  if (type === "action_verb") {
    return (
      <Zap className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" aria-hidden="true" />
    );
  }
  if (type === "impact_metric") {
    return (
      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" aria-hidden="true" />
    );
  }
  return (
    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" aria-hidden="true" />
  );
}

interface SuggestionItemRowProps {
  item: SuggestionItem;
}

function SuggestionItemRow({ item }: SuggestionItemRowProps) {
  return (
    <div className="flex items-start gap-2">
      {getTypeIcon(item.type)}
      <p className="text-sm text-foreground flex-1 leading-relaxed">{item.text}</p>
      <Badge variant="outline" className={getPriorityBadgeClasses(item.priority)}>
        {item.priority === "high_impact" ? "High Impact" : "Quick Win"}
      </Badge>
    </div>
  );
}

interface SuggestionCardItemProps {
  card: SuggestionCard;
}

export function SuggestionCardItem({ card }: SuggestionCardItemProps) {
  return (
    <Card className="p-4">
      <h3 className="text-base font-semibold text-foreground mb-3">{card.section}</h3>
      <div className="space-y-3">
        {card.suggestions.map((item, i) => (
          <SuggestionItemRow key={i} item={item} />
        ))}
      </div>
    </Card>
  );
}
