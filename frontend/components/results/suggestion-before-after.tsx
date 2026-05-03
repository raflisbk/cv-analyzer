"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionBeforeAfterProps {
  beforeText: string;
  id: string;
}

export function SuggestionBeforeAfter({ beforeText, id }: SuggestionBeforeAfterProps) {
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
        <div className="bg-muted rounded-md p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Original:</p>
          <p className="text-sm font-medium text-foreground">{beforeText}</p>
        </div>
      </div>
    </div>
  );
}
