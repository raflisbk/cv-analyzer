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

export function useInlineEdit(jobId: string): UseInlineEditResult {
  const initialized = useRef(false);

  const docRef = useRef<Y.Doc | null>(null);
  const inlineEditsMapRef = useRef<Y.Map<any> | null>(null);

  const [state, setState] = useState<InlineEditState>({
    selectedText: "",
    selectionRect: null,
    isVisible: false,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!jobId) return;

    if (initialized.current) return;
    initialized.current = true;

    const doc = new Y.Doc();
    docRef.current = doc;

    const inlineEditsMap = doc.getMap("inline_edits");
    inlineEditsMapRef.current = inlineEditsMap;

    return () => {
      doc.destroy();
      docRef.current = null;
      inlineEditsMapRef.current = null;
      initialized.current = false;
    };
  }, [jobId]);

  const handleSelectionChange = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const selection = window.getSelection();

        if (!selection || selection.isCollapsed) {
        setState({
          selectedText: "",
          selectionRect: null,
          isVisible: false,
        });
        return;
      }

      const selectedText = selection.toString().trim();

        if (selectedText.length < MIN_SELECTION_LENGTH) {
        setState({
          selectedText: "",
          selectionRect: null,
          isVisible: false,
        });
        return;
      }

      if (selectedText.length > MAX_SELECTION_LENGTH) {
            const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setState({
          selectedText,
          selectionRect: rect,
          isVisible: true,
        });
        return;
      }

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

  const closePopover = useCallback(() => {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setState({
      selectedText: "",
      selectionRect: null,
      isVisible: false,
    });
  }, []);

  const applyRewrite = useCallback(
    (editId: string, originalText: string, rewrittenText: string) => {
      if (!inlineEditsMapRef.current) {
        console.warn("[useInlineEdit] Yjs map not initialized");
        return;
      }

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

        closePopover();
    },
    [closePopover]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (state.isVisible) {
        closePopover();
      }
    };

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
