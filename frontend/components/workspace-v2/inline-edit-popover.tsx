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
  rectPercent?: { left: number; top: number; width: number; height: number };
  selectedText: string;
  jobId: string;
  onClose: () => void;
}

interface RewritePreview {
  original: string;
  rewritten: string;
}

export function InlineEditPopover({
  rect,
  rectPercent,
  selectedText,
  jobId,
  onClose,
}: InlineEditPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { applyInlineEdit, hydration } = useWorkspaceV2Store();

  const [popoverState, setPopoverState] = useState<PopoverState>("prompt");
  const [prompt, setPrompt] = useState("");
  const [preview, setPreview] = useState<RewritePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editId] = useState(() => `${EDIT_ID_PREFIX}${Date.now()}`);

  const isTooLong = selectedText.length > MAX_SELECTION_LENGTH;

  useEffect(() => {
    if (isTooLong) {
      setPopoverState("too_long");
    }
  }, [isTooLong]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    setPopoverState("loading");
    setError(null);

    try {
      const cvContext = hydration?.analysis
        ? {
            scores: hydration.analysis.scores,
            skills: hydration.analysis.skills,
          }
        : null;

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
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate rewrite. Please try again.",
      );
      setPopoverState("error");
    }
  };

  const handleApply = () => {
    if (!preview) {
      return;
    }

    applyInlineEdit(editId, preview.original, preview.rewritten, rectPercent);
    onClose();
  };

  const handleReset = () => {
    setPopoverState("prompt");
    setError(null);
  };

  const top = rect.top - 8;
  const left = rect.left + rect.width / 2;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Edit with AI"
      className="fixed z-50 w-[380px] max-w-[90vw] rounded-lg border border-[#111111]/15 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="flex items-center justify-between rounded-t-lg border-b border-[#111111]/10 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#111111]" />
          <span className="text-sm font-bold text-[#111111] uppercase tracking-wider">
            AI Edit
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md border border-transparent p-1 text-[#111111] transition-colors hover:border-[#111111]/15 hover:bg-[#F5F2D8]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-b-lg bg-white p-4">
        {popoverState === "too_long" && (
          <div className="space-y-3">
            <p className="text-sm text-[#111111]">
              Please select <strong>500 characters or less</strong> to edit with
              AI.
            </p>
            <p className="text-xs text-[#111111]/70 font-mono">
              Current selection: {selectedText.length} characters
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-md border border-[#111111]/15 bg-[#CAFF43] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#b9ed35]"
            >
              Got it
            </button>
          </div>
        )}

        {popoverState === "prompt" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#111111]/15 bg-white p-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#111111]">
                Selected text
              </p>
              <p className="text-sm text-[#111111] line-clamp-3 font-serif italic">
                {selectedText}
              </p>
            </div>

            <div>
              <label
                htmlFor="prompt-input"
                className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#111111]"
              >
                How should we improve this?
              </label>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make this more impactful, Add metrics, Improve clarity..."
                maxLength={1000}
                className="w-full min-h-[80px] resize-y rounded-md border border-[#111111]/15 bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#111111]/40 transition-colors focus:border-[#111111]/40 focus:outline-none focus:ring-2 focus:ring-[#CAFF43]/30"
                rows={3}
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="w-full rounded-md border border-[#111111]/15 bg-[#CAFF43] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#b9ed35] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate rewrite
            </button>
          </div>
        )}

        {popoverState === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#CAFF43]" />
            <p className="text-sm font-medium text-[#111111]/80">
              Generating rewrite...
            </p>
          </div>
        )}

        {popoverState === "preview" && preview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="relative rounded-lg border border-[#ff5555]/35 bg-white p-3">
                <div className="absolute -top-2.5 left-2 rounded border border-[#ff5555]/35 bg-[#ff5555] px-2 py-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white">
                    Before
                  </p>
                </div>
                <p className="text-xs text-[#111111] line-clamp-4 mt-2 font-serif italic line-through decoration-[#ff5555]/50">
                  {preview.original}
                </p>
              </div>

              <div className="relative rounded-lg border border-[#CAFF43]/35 bg-white p-3">
                <div className="absolute -top-2.5 left-2 rounded border border-[#CAFF43]/35 bg-[#CAFF43] px-2 py-0.5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#111111]">
                    After
                  </p>
                </div>
                <p className="text-xs text-[#111111] line-clamp-4 mt-2 font-serif">
                  {preview.rewritten}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 rounded-md border border-[#111111]/15 bg-[#CAFF43] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#b9ed35]"
              >
                Apply
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-[#111111]/15 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#F5F2D8]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {popoverState === "error" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#ff5555]/35 border-t border-t-[#ff5555] bg-white p-3">
              <p className="text-sm font-bold text-[#111111]">
                Failed to generate rewrite
              </p>
              <p className="text-xs text-[#111111]/70 mt-1">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 rounded-md border border-[#111111]/15 bg-[#CAFF43] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#b9ed35]"
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-[#111111]/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#F5F2D8]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
