"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/core";
import type { MutableRefObject } from "react";
import { resolveGrammar } from "@/lib/app-api/grammar";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import { replaceDocumentText } from "@/lib/app-workspace/document-edit";

export function useAppWorkspaceGrammar(
  editorRef: MutableRefObject<Editor | null>,
  jobId: string,
  grammar?: GrammarData,
) {
  const [resolvedGrammar, setResolvedGrammar] = useState<Set<string>>(
    () => new Set(),
  );
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
  return { resolvedGrammar, onGrammar };
}
