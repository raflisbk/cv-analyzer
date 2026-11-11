"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { usePathy } from "@/components/pathy/pathy-context";
import { resolveGrammar } from "@/lib/app-api/grammar";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import type { SuggestionCard } from "@/lib/types";
import { flattenFixes, type WorkspaceFix } from "@/lib/app-workspace/fixes";
import {
  appendSkill,
  insertDocumentText,
  replaceDocumentText,
} from "@/lib/app-workspace/document-edit";
import { hasUnsupportedNumbers } from "@/lib/app-workspace/factual-rewrite";

export function useAppWorkspaceEdits(
  jobId: string,
  source: string,
  suggestions?: SuggestionCard[] | null,
  grammar?: GrammarData,
) {
  const pathy = usePathy();
  const editorRef = useRef<Editor | null>(null);
  const [applied, setApplied] = useState<Set<string>>(() => new Set());
  const [resolvedGrammar, setResolvedGrammar] = useState<Set<string>>(
    () => new Set(),
  );
  const [bonus, setBonus] = useState(0);
  const allFixes = useMemo(() => flattenFixes(suggestions), [suggestions]);
  const fixes = useMemo(
    () => allFixes.filter((fix) => !applied.has(fix.id)),
    [allFixes, applied],
  );
  const setEditor = useCallback((editor: Editor | null) => {
    editorRef.current = editor;
  }, []);
  function applyFix(fix: WorkspaceFix, text: string, anchor: HTMLElement) {
    const provided = text.match(/\d+(?:[.,]\d+)?%?/)?.[0] ?? "";
    if (
      hasUnsupportedNumbers(
        source,
        text,
        fix.after.includes("[") ? provided : "",
      )
    ) {
      return false;
    }
    const written = fix.before
      ? replaceDocumentText(editorRef.current, fix.before, text)
      : insertDocumentText(editorRef.current, text);
    if (!written) {
      return false;
    }
    setApplied((current) => new Set(current).add(fix.id));
    setBonus((current) => current + fix.points);
    pathy.react(
      fix.points > 1 ? "trophy" : "proud",
      `+${fix.points} points!`,
      anchor,
    );
    return true;
  }
  async function onGrammar(id: string, action: "accept" | "ignore") {
    const note = grammar?.notes.find((item) => item.id === id);
    if (!note) {
      return;
    }
    await resolveGrammar(jobId, id, action);
    if (action === "accept") {
      replaceDocumentText(editorRef.current, note.before, note.after);
    }
    setResolvedGrammar((current) => new Set(current).add(id));
  }
  return {
    fixes,
    bonus,
    resolvedGrammar,
    setEditor,
    applyFix,
    onGrammar,
    addSkill: (skill: string) => appendSkill(editorRef.current, skill),
  };
}
