"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import { GrammarNote } from "./grammar-note";
import { GrammarFilters, type GrammarFilter } from "./grammar-filters";
import { GrammarAcceptAll } from "./grammar-accept-all";

export function GrammarNotes({
  notes,
  onResolve,
}: {
  notes: GrammarData["notes"];
  onResolve: (id: string, action: "accept" | "ignore") => Promise<void>;
}) {
  const { t } = useT();
  const [filter, setFilter] = useState<GrammarFilter>("all");
  const [error, setError] = useState("");
  async function resolve(id: string, action: "accept" | "ignore") {
    try {
      setError("");
      await onResolve(id, action);
    } catch {
      setError(t("appWorkspacePanel.grammar.updateFailed"));
    }
  }
  return (
    <>
      <GrammarFilters filter={filter} setFilter={setFilter} notes={notes} />
      {error && <p role="alert">{error}</p>}
      {notes
        .filter((note) => filter === "all" || note.type === filter)
        .map((note) => (
          <GrammarNote
            key={note.id}
            note={note}
            onResolve={(action) => void resolve(note.id, action)}
          />
        ))}
      <GrammarAcceptAll notes={notes} accept={(id) => resolve(id, "accept")} />
    </>
  );
}
