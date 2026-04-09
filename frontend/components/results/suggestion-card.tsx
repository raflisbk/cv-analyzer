/**
 * SuggestionCardItem — renders one suggestion card for a CV section.
 * SuggestionItemRow — internal component for a single suggestion row.
 * Per UI-SPEC Phase 3 §6 sections B and C.
 */
"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface SuggestionBeforeAfterProps {
  beforeText?: string;
  afterText: string;
  id: string;
}

function getNormalizedBeforeText(item: SuggestionItem): string | undefined {
  const unsafeItem = item as unknown as Record<string, unknown>;
  if (
    process.env.NODE_ENV !== "production" &&
    unsafeItem.original_text &&
    !item.originalText
  ) {
    console.warn(
      "Suggestion item includes original_text but missing normalized originalText"
    );
  }

  return item.originalText?.trim() ? item.originalText : undefined;
}

function SuggestionBeforeAfter({ beforeText, afterText, id }: SuggestionBeforeAfterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `suggestion-before-${id}`;
  const triggerId = `suggestion-before-trigger-${id}`;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <Button
        id={triggerId}
        variant="ghost"
        size="sm"
        className="text-sm font-medium h-auto p-0 hover:bg-transparent"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {isOpen ? "Hide original context" : "Show original context"}
        {isOpen
          ? <ChevronUp className="h-3 w-3 ml-1" />
          : <ChevronDown className="h-3 w-3 ml-1" />
        }
      </Button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96 mt-4" : "max-h-0"
        }`}
      >
        <div className="space-y-2">
          {beforeText ? (
            <>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-semibold text-red-700 mb-1">Before:</p>
                <p className="text-sm text-red-900">{beforeText}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm font-semibold text-green-700 mb-1">After:</p>
                <p className="text-sm text-green-900">{afterText}</p>
              </div>
            </>
          ) : (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">No original text available for comparison.</p>
            </div>
          )}
        </div>
      </div>
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
          <div key={i}>
            <SuggestionItemRow item={item} />
            {/*
              Before/after toggle per D-C19, UX-02.
              Regression guard: this component intentionally reads normalized
              camelCase `originalText` only.
            */}
            <SuggestionBeforeAfter
              beforeText={getNormalizedBeforeText(item)}
              afterText={item.text}
              id={`${card.section}-${i}`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
