"use client";

/**
 * SuggestionBeforeAfter — Expandable toggle showing original CV text context.
 * Per UI-SPEC §7.6, UX-02. Collapses with max-h CSS transition.
 * Accessibility: aria-expanded + aria-controls on button; role="region" on collapsible div.
 * Will be embedded in SuggestionCard in Wave 4 (04-06).
 */

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionBeforeAfterProps {
  /** The original CV text context (stored in suggestion card from Phase 3) */
  beforeText: string;
  /** Unique id for ARIA linking — should be unique per suggestion card */
  id: string;
}

export function SuggestionBeforeAfter({ beforeText, id }: SuggestionBeforeAfterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `suggestion-before-${id}`;
  const triggerId = `suggestion-before-trigger-${id}`;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {/* Toggle button per UI-SPEC §7.6 */}
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

      {/* Collapsible content per UI-SPEC §7.6 max-h transition */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96 mt-4" : "max-h-0"
        }`}
      >
        <div className="bg-muted rounded-md p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Original:</p>
          <p className="text-sm font-medium text-foreground">{beforeText}</p>
        </div>
      </div>
    </div>
  );
}
