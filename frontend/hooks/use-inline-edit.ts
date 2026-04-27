/**
 * use-inline-edit.ts — Text selection detection hook for inline AI editing.
 *
 * Phase 15 deliverable: INLINE-01 (text selection detection) + INLINE-03 (Yjs persistence).
 * Detects text selection in PDF viewer, calculates coordinates, manages popover state.
 *
 * Key patterns:
 * - window.getSelection() API for text selection detection
 * - Debounced onMouseUp handler to avoid rapid re-renders
 * - Coordinate calculation via range.getBoundingClientRect()
 * - Yjs integration for inline edits persistence
 * - StrictMode guard ref pattern (per Phase 13)
 */
"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import * as Y from "yjs";

export interface InlineEditState {
  selectedText: string;
  selectionRect: DOMRect | null;
  rectPercent?: { left: number; top: number; width: number; height: number };
  isVisible: boolean;
}

interface UseInlineEditResult {
  state: InlineEditState;
  handleSelectionChange: () => void;
  closePopover: () => void;
  applyRewrite: (editId: string, originalText: string, rewrittenText: string) => void;
}

const MIN_SELECTION_LENGTH = 2;
const MAX_SELECTION_LENGTH = 500;
const SELECTION_DEBOUNCE_MS = 150;

/**
 * Hook untuk mendeteksi text selection dan mengelola inline edit popover state.
 *
 * @param jobId - Job UUID untuk Yjs scoping
 * @returns Inline edit state dan handler functions
 *
 * @example
 * // Dalam "use client" component:
 * const { state, handleSelectionChange, closePopover } = useInlineEdit(jobId);
 */
export function useInlineEdit(jobId: string): UseInlineEditResult {
  // StrictMode guard ref (per Phase 13 pattern)
  const initialized = useRef(false);

  // Yjs refs for inline edits persistence
  const docRef = useRef<Y.Doc | null>(null);
  const inlineEditsMapRef = useRef<Y.Map<any> | null>(null);

  // Selection state
  const [state, setState] = useState<InlineEditState>({
    selectedText: "",
    selectionRect: null,
    isVisible: false,
  });

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize Yjs Doc for inline edits persistence
   * Phase 15: INLINE-03 - Store inline edits in separate Y.Map
   */
  useEffect(() => {
    if (!jobId) return;

    // StrictMode guard
    if (initialized.current) return;
    initialized.current = true;

    // Create Y.Doc for inline edits (separate from suggestion_statuses)
    const doc = new Y.Doc();
    docRef.current = doc;

    // Shared map for inline edits, keyed by edit_id
    const inlineEditsMap = doc.getMap("inline_edits");
    inlineEditsMapRef.current = inlineEditsMap;

    console.log("[useInlineEdit] Yjs initialized for job:", jobId);

    // Cleanup
    return () => {
      doc.destroy();
      docRef.current = null;
      inlineEditsMapRef.current = null;
      initialized.current = false;
    };
  }, [jobId]);

  /**
   * Handle text selection changes
   * Detects selection, validates length, calculates coordinates
   */
  const handleSelectionChange = useCallback(() => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce selection detection
    debounceTimerRef.current = setTimeout(() => {
      const selection = window.getSelection();

      // Dismiss if no selection or collapsed (cursor only)
      if (!selection || selection.isCollapsed) {
        setState({
          selectedText: "",
          selectionRect: null,
          isVisible: false,
        });
        return;
      }

      const selectedText = selection.toString().trim();

      // Validate selection length
      if (selectedText.length < MIN_SELECTION_LENGTH) {
        setState({
          selectedText: "",
          selectionRect: null,
          isVisible: false,
        });
        return;
      }

      if (selectedText.length > MAX_SELECTION_LENGTH) {
        // Show warning state (too long)
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setState({
          selectedText,
          selectionRect: rect,
          isVisible: true,
        });
        return;
      }

      // Valid selection - calculate coordinates
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      let rectPercent = undefined;
      const pageEl = document.querySelector(".react-pdf__Page");
      if (pageEl) {
        const pageRect = pageEl.getBoundingClientRect();
        rectPercent = {
          left: ((rect.left - pageRect.left) / pageRect.width) * 100,
          top: ((rect.top - pageRect.top) / pageRect.height) * 100,
          width: (rect.width / pageRect.width) * 100,
          height: (rect.height / pageRect.height) * 100,
        };
      }

      setState({
        selectedText,
        selectionRect: rect,
        rectPercent,
        isVisible: true,
      });

      console.log("[useInlineEdit] Text selected:", {
        length: selectedText.length,
        preview: selectedText.slice(0, 30),
        rect: { top: rect.top, left: rect.left, width: rect.width },
        rectPercent,
      });
    }, SELECTION_DEBOUNCE_MS);
  }, []);

  /**
   * Close popover and clear selection
   */
  const closePopover = useCallback(() => {
    // Clear browser selection
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Reset state
    setState({
      selectedText: "",
      selectionRect: null,
      isVisible: false,
    });
  }, []);

  /**
   * Apply rewrite to document state
   * Phase 15: INLINE-03 - Store edit record in Yjs
   */
  const applyRewrite = useCallback(
    (editId: string, originalText: string, rewrittenText: string) => {
      if (!inlineEditsMapRef.current) {
        console.warn("[useInlineEdit] Yjs map not initialized");
        return;
      }

      // Store edit record in Yjs
      const editRecord = {
        editId,
        originalText,
        rewrittenText,
        appliedAt: new Date().toISOString(),
      };

      inlineEditsMapRef.current.set(editId, editRecord);

      console.log("[useInlineEdit] Rewrite applied:", {
        editId,
        originalLength: originalText.length,
        rewrittenLength: rewrittenText.length,
      });

      // Clear selection after apply
      closePopover();
    },
    [closePopover]
  );

  /**
   * Dismiss popover on scroll
   * Improves UX by clearing selection when user scrolls away
   */
  useEffect(() => {
    const handleScroll = () => {
      if (state.isVisible) {
        closePopover();
      }
    };

    // Add scroll listener to window
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [state.isVisible, closePopover]);

  return {
    state,
    handleSelectionChange,
    closePopover,
    applyRewrite,
  };
}
