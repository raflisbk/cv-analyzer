"use client";

import { useMemo, useState } from "react";
import type { Editor } from "@tiptap/core";
import type { MutableRefObject } from "react";
import { usePathy } from "@/components/pathy/pathy-context";
import type { SuggestionCard } from "@/lib/types";
import { flattenFixes, type WorkspaceFix } from "@/lib/app-workspace/fixes";
import {
  insertDocumentText,
  replaceDocumentText,
} from "@/lib/app-workspace/document-edit";
import { canApplyFix } from "@/lib/app-workspace/factual-rewrite";

export function useAppWorkspaceFixes(
  editorRef: MutableRefObject<Editor | null>,
  source: string,
  suggestions?: SuggestionCard[] | null,
) {
  const pathy = usePathy();
  const [applied, setApplied] = useState<Set<string>>(() => new Set());
  const [appliedAnswers, setAppliedAnswers] = useState<
    Record<string, Record<string, string>>
  >({});
  const [bonus, setBonus] = useState(0);
  const allFixes = useMemo(() => flattenFixes(suggestions), [suggestions]);
  const fixes = useMemo(
    () => allFixes.filter((fix) => !applied.has(fix.id)),
    [allFixes, applied],
  );
  function applyFix(
    fix: WorkspaceFix,
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string> = {},
  ) {
    if (!canApplyFix(source, text, fix.after, answers)) {
      return false;
    }
    const written = fix.before
      ? replaceDocumentText(editorRef.current, fix.before, text)
      : insertDocumentText(editorRef.current, text);
    if (!written) {
      return false;
    }
    setApplied((current) => new Set(current).add(fix.id));
    setAppliedAnswers((current) => ({ ...current, [fix.id]: answers }));
    setBonus((current) => current + fix.points);
    pathy.react(
      fix.points > 1 ? "trophy" : "proud",
      `+${fix.points} points!`,
      anchor,
    );
    return true;
  }
  return {
    fixes,
    bonus,
    applyFix,
    appliedFixIds: [...applied],
    appliedAnswers,
  };
}
