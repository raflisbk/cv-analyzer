"use client";

import { useMemo, useState } from "react";
import type { Editor } from "@tiptap/core";
import type { MutableRefObject } from "react";
import type { SuggestionCard } from "@/lib/types";
import { flattenFixes, type WorkspaceFix } from "@/lib/app-workspace/fixes";
import { useAppFixApplication } from "./use-app-fix-application";

export function useAppWorkspaceFixes(
  editorRef: MutableRefObject<Editor | null>,
  source: string,
  suggestions?: SuggestionCard[] | null,
) {
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
  const applyFix = useAppFixApplication(
    editorRef,
    source,
    (fix: WorkspaceFix, answers) => {
      setApplied((current) => new Set(current).add(fix.id));
      setAppliedAnswers((current) => ({ ...current, [fix.id]: answers }));
      setBonus((current) => current + fix.points);
    },
  );
  return {
    fixes,
    bonus,
    applyFix,
    appliedFixIds: [...applied],
    appliedAnswers,
  };
}
