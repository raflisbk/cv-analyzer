"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getResultsPriorityBadgeClasses,
  getSuggestionPriorityLabel,
} from "@/lib/suggestion-priority";
import type {
  SuggestionCard,
  SuggestionItem,
  SuggestionType,
} from "@/lib/types";

function getTypeIcon(type: SuggestionType) {
  if (type === "action_verb") {
    return (
      <Zap
        className="h-4 w-4 mt-0.5 shrink-0"
        style={{ color: "#8B5CF6" }}
        aria-hidden="true"
      />
    );
  }
  if (type === "impact_metric") {
    return (
      <TrendingUp
        className="h-4 w-4 mt-0.5 shrink-0"
        style={{ color: "#FF8C42" }}
        aria-hidden="true"
      />
    );
  }
  return (
    <AlertCircle
      className="h-4 w-4 mt-0.5 shrink-0"
      style={{ color: "#FF4FCB" }}
      aria-hidden="true"
    />
  );
}

interface SuggestionItemRowProps {
  item: SuggestionItem;
}

function SuggestionItemRow({ item }: SuggestionItemRowProps) {
  return (
    <div className="flex items-start gap-2">
      {getTypeIcon(item.type)}
      <p className="text-sm text-[#F5F2D8] flex-1 leading-relaxed">
        {item.text}
      </p>
      <Badge
        variant="outline"
        className={getResultsPriorityBadgeClasses(item.priority)}
      >
        {getSuggestionPriorityLabel(item.priority)}
      </Badge>
    </div>
  );
}

interface SuggestionBeforeAfterProps {
  beforeText?: string;
  afterText?: string;
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
      "Suggestion item includes original_text but missing normalized originalText",
    );
  }

  return item.originalText?.trim() ? item.originalText : undefined;
}

function SuggestionBeforeAfter({
  beforeText,
  afterText,
  id,
}: SuggestionBeforeAfterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `suggestion-before-${id}`;
  const triggerId = `suggestion-before-trigger-${id}`;

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.07]">
      <Button
        id={triggerId}
        variant="ghost"
        size="sm"
        className="text-sm font-medium h-auto p-0 hover:bg-transparent text-[#F5F2D8]/50 hover:text-[#F5F2D8]"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {isOpen ? "Hide original context" : "Show original context"}
        {isOpen ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2">
            {beforeText && afterText ? (
              <>
                <div className="p-3 bg-[#FF4FCB]/8 border border-[#FF4FCB]/20 rounded-xl">
                  <p className="text-xs font-bold text-[#FF4FCB] mb-1 uppercase tracking-wider">
                    Before:
                  </p>
                  <p className="text-sm text-[#F5F2D8]/60">{beforeText}</p>
                </div>
                <div className="p-3 bg-[#CAFF43]/8 border border-[#CAFF43]/20 rounded-xl">
                  <p className="text-xs font-bold text-[#CAFF43] mb-1 uppercase tracking-wider">
                    After:
                  </p>
                  <p className="text-sm text-[#F5F2D8]/60">{afterText}</p>
                </div>
              </>
            ) : beforeText ? (
              <div className="p-3 bg-[#FF4FCB]/8 border border-[#FF4FCB]/20 rounded-xl">
                <p className="text-xs font-bold text-[#FF4FCB] mb-1 uppercase tracking-wider">
                  Original text:
                </p>
                <p className="text-sm text-[#F5F2D8]/60">{beforeText}</p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white/[0.04]">
                <p className="text-sm text-[#F5F2D8]/40">
                  No original text available for comparison.
                </p>
              </div>
            )}
          </div>
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
    <div className="border-y border-dashed border-white/15 bg-[#141414] p-5">
      <h3 className="text-sm font-extrabold text-[#F5F2D8]/60 uppercase tracking-wider mb-4">
        {card.section}
      </h3>
      <div className="space-y-4">
        {card.suggestions.map((item, i) => (
          <div key={i}>
            <SuggestionItemRow item={item} />
            <SuggestionBeforeAfter
              beforeText={getNormalizedBeforeText(item)}
              afterText={item.afterText}
              id={`${card.section}-${i}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
