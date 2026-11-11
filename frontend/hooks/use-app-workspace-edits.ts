"use client";

import { useCallback, useRef } from "react";
import type { Editor } from "@tiptap/core";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import type { SuggestionCard } from "@/lib/types";
import { appendSkill } from "@/lib/app-workspace/document-edit";
import { useAppWorkspaceFixes } from "./use-app-workspace-fixes";
import { useAppWorkspaceGrammar } from "./use-app-workspace-grammar";

export function useAppWorkspaceEdits(
  jobId: string,
  source: string,
  suggestions?: SuggestionCard[] | null,
  grammar?: GrammarData,
) {
  const editorRef = useRef<Editor | null>(null);
  const fixes = useAppWorkspaceFixes(editorRef, source, suggestions);
  const notes = useAppWorkspaceGrammar(editorRef, jobId, grammar);
  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);
  return {
    ...fixes,
    ...notes,
    setEditor,
    addSkill: (skill: string) => appendSkill(editorRef.current, skill),
  };
}
