"use client";
/**
 * InlineAIPopup — Floating "Improve" button on text selection.
 * Phase 17: AI-powered text improvement in Tiptap editor.
 *
 * Shows popup when user selects text in editor.
 * On click, calls AI API to improve selected text.
 */
import { useState, useCallback, useEffect } from "react";
import { Wand2, Loader2 } from "lucide-react";

interface InlineAIPopupProps {
  onApplyImprovement: (originalText: string, improvedText: string) => void;
}

export function InlineAIPopup({ onApplyImprovement }: InlineAIPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Handle text selection
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsVisible(false);
      setSelectedText("");
      setPosition(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 3) {
      setIsVisible(false);
      setSelectedText("");
      setPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Only show if selection is within editor
    const editorElement = document.querySelector(".ProseMirror");
    if (!editorElement || !editorElement.contains(range.commonAncestorContainer)) {
      setIsVisible(false);
      setSelectedText("");
      setPosition(null);
      return;
    }

    setSelectedText(text);
    setPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setIsVisible(true);
  }, []);

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Call AI API to improve text
  const handleImprove = async () => {
    if (!selectedText || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
          prompt: "Improve this text for a CV. Make it more impactful and professional.",
          cvContext: null,
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("AI improve failed:", data.error);
        alert("Failed to improve text. Please try again.");
        return;
      }

      const improved = data.data.rewrittenText;
      if (improved) {
        onApplyImprovement(selectedText, improved);
        setIsVisible(false);
      }
    } catch (err) {
      console.error("AI improve error:", err);
      alert("Failed to improve text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hide popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".inline-ai-popup") && !target.closest(".ProseMirror")) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible]);

  if (!isVisible || !position) {
    return null;
  }

  return (
    <div
      className="inline-ai-popup fixed z-50 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-lg border border-gray-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 50}px`,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onClick={handleImprove}
        disabled={isLoading}
        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Improving...
          </>
        ) : (
          <>
            <Wand2 className="h-3.5 w-3.5 text-[#CAFF43]" />
            Improve with AI
          </>
        )}
      </button>
    </div>
  );
}
