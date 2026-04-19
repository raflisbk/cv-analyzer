/**
 * inline-edit-popover.tsx — Portal-based popover for inline AI editing.
 *
 * Phase 15 deliverable: INLINE-02 (popover UI states) + INLINE-03 (API integration).
 * Renders above text selection with prompt input, loading, preview, error, and warning states.
 *
 * Key patterns:
 * - React Portal rendering to document.body (avoids z-index issues)
 * - Fixed positioning with coordinate calculation from selection
 * - 5 UI states: prompt input, loading, preview, error, selection too long
 * - Backdrop blur with Mathical-inspired styling
 * - Fade-in + slide-up animation (200ms)
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Loader2, X, Sparkles } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";

const MAX_SELECTION_LENGTH = 500;
const EDIT_ID_PREFIX = "inline-edit-";

type PopoverState = "prompt" | "loading" | "preview" | "error" | "too_long";

interface InlineEditPopoverProps {
  rect: DOMRect;
  selectedText: string;
  jobId: string;
  onClose: () => void;
}

interface RewritePreview {
  original: string;
  rewritten: string;
}

/**
 * InlineEditPopover — Portal-based popover for AI inline editing
 *
 * Renders above text selection with prompt input, AI rewrite preview, and apply/cancel actions.
 * Uses Portal to avoid z-index issues with PDF viewer overlay.
 */
export function InlineEditPopover({
  rect,
  selectedText,
  jobId,
  onClose,
}: InlineEditPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { applyInlineEdit, hydration } = useWorkspaceV2Store();

  // State management
  const [popoverState, setPopoverState] = useState<PopoverState>("prompt");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState<RewritePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editId] = useState(() => `${EDIT_ID_PREFIX}${Date.now()}`);

  // Check if selection is too long
  const isTooLong = selectedText.length > MAX_SELECTION_LENGTH;

  // Set initial state based on selection length
  useEffect(() => {
    if (isTooLong) {
      setPopoverState("too_long");
    }
  }, [isTooLong]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  /**
   * Generate AI rewrite
   * Calls backend endpoint and handles loading/error states
   */
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setPopoverState("loading");
    setError(null);

    try {
      // Fetch cvContext from store hydration
      const cvContext = hydration?.analysis ? {
        scores: hydration.analysis.scores,
        skills: hydration.analysis.skills,
      } : null;

      const response = await fetch(`/api/v1/jobs/${jobId}/inline-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
          prompt,
          cvContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate rewrite");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setPreview({
        original: selectedText,
        rewritten: data.data.rewrittenText,
      });

      setPopoverState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate rewrite. Please try again.");
      setPopoverState("error");
    }
  };

  /**
   * Apply rewrite to document state
   * Calls store action and closes popover
   */
  const handleApply = () => {
    if (!preview) return;

    applyInlineEdit(editId, preview.original, preview.rewritten);
    onClose();
  };

  /**
   * Reset to prompt state
   */
  const handleReset = () => {
    setPopoverState("prompt");
    setError(null);
  };

  // Positioning: Fixed positioning above selection
  const top = rect.top - 8; // 8px gap above selection
  const left = rect.left + rect.width / 2; // Center horizontally

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Edit with AI"
      className="fixed z-50 w-[380px] max-w-[90vw] rounded-xl border border-[rgba(17,17,17,0.12)] bg-[rgba(255,255,255,0.96)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.14)] animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.08)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#CAFF43]" />
          <span className="text-sm font-bold text-[#111111]">Edit with AI</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1 text-[#111111]/60 hover:bg-[rgba(17,17,17,0.06)] hover:text-[#111111] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {popoverState === "too_long" && (
          <div className="space-y-3">
            <p className="text-sm text-[#111111]/80">
              Please select <strong>500 characters or less</strong> to edit with AI.
            </p>
            <p className="text-xs text-[#111111]/60">
              Current selection: {selectedText.length} characters
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-full bg-[#CAFF43] px-4 py-2 text-[11px] font-black uppercase text-[#111111] transition-colors hover:bg-[#CAFF43]/90"
            >
              Got it
            </button>
          </div>
        )}

        {popoverState === "prompt" && (
          <div className="space-y-3">
            <div className="rounded-lg bg-[rgba(17,17,17,0.04)] p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#111111]/60">
                Selected text
              </p>
              <p className="text-sm text-[#111111] line-clamp-3">{selectedText}</p>
            </div>

            <div>
              <label htmlFor="prompt-input" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#111111]/60">
                How should we improve this?
              </label>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make this more impactful, Add metrics, Improve clarity..."
                className="w-full min-h-[80px] resize-y rounded-lg border border-[rgba(17,17,17,0.15)] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#111111]/40 focus:border-[#CAFF43] focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/20"
                rows={3}
                autoFocus
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-full rounded-full bg-[#CAFF43] px-4 py-2.5 text-[11px] font-black uppercase text-[#111111] transition-colors hover:bg-[#CAFF43]/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#CAFF43]"
            >
              Generate rewrite
            </button>
          </div>
        )}

        {popoverState === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#CAFF43]" />
            <p className="text-sm font-medium text-[#111111]/80">Generating rewrite...</p>
          </div>
        )}

        {popoverState === "preview" && preview && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {/* Before */}
              <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-red-500">
                  Before
                </p>
                <p className="text-xs text-red-200 line-clamp-4">{preview.original}</p>
              </div>

              {/* After */}
              <div className="rounded-lg bg-green-500/10 p-3 border border-green-500/20">
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-green-500">
                  After
                </p>
                <p className="text-xs text-green-200 line-clamp-4">{preview.rewritten}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 rounded-full bg-[#CAFF43] px-4 py-2 text-[11px] font-black uppercase text-[#111111] transition-colors hover:bg-[#CAFF43]/90"
              >
                Apply
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-[rgba(17,17,17,0.15)] px-4 py-2 text-[11px] font-black uppercase text-[#111111] transition-colors hover:bg-[rgba(17,17,17,0.06)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {popoverState === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 rounded-full bg-[#CAFF43] px-4 py-2 text-[11px] font-black uppercase text-[#111111] transition-colors hover:bg-[#CAFF43]/90"
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-full border border-[rgba(17,17,17,0.15)] px-4 py-2 text-[11px] font-black uppercase text-[#111111] transition-colors hover:bg-[rgba(17,17,17,0.06)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
