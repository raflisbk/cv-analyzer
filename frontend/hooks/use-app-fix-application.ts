"use client";

import type { Editor } from "@tiptap/core";
import type { MutableRefObject } from "react";
import { usePathy } from "@/components/pathy/pathy-context";
import type { WorkspaceFix } from "@/lib/app-workspace/fixes";
import {
  insertDocumentText,
  replaceDocumentText,
} from "@/lib/app-workspace/document-edit";
import { canApplyFix } from "@/lib/app-workspace/factual-rewrite";

export function useAppFixApplication(
  editorRef: MutableRefObject<Editor | null>,
  source: string,
  onApplied: (fix: WorkspaceFix, answers: Record<string, string>) => void,
) {
  const pathy = usePathy();
  return function applyFix(
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
    onApplied(fix, answers);
    pathy.react(
      fix.points > 1 ? "trophy" : "proud",
      `+${fix.points} points!`,
      anchor,
    );
    return true;
  };
}
