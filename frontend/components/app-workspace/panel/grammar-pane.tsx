"use client";

import { useState } from "react";
import type { GrammarData } from "@/lib/app-api/grammar.types";
import { GrammarNote } from "./grammar-note";
import { GrammarSummary } from "./grammar-summary";
import styles from "../workspace-styles";

type Filter = "all" | "spelling" | "grammar" | "style";
export function GrammarPane({
  data,
  error,
  resolved,
  onResolve,
}: {
  data?: GrammarData;
  error?: Error | null;
  resolved: Set<string>;
  onResolve: (id: string, action: "accept" | "ignore") => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [actionError, setActionError] = useState("");
  if (error) {
    return (
      <div role="alert">Grammar notes could not load. Try again later.</div>
    );
  }
  if (!data) {
    return <div role="status">Loading grammar notes…</div>;
  }
  const remaining = data.notes.filter((note) => !resolved.has(note.id));
  async function resolve(id: string, action: "accept" | "ignore") {
    try {
      setActionError("");
      await onResolve(id, action);
    } catch {
      setActionError("The note could not be updated. Try again.");
    }
  }
  return (
    <div className={styles.pane}>
      <GrammarSummary count={remaining.length} stats={data.stats} />
      <div className={styles.row}>
        {(["all", "spelling", "grammar", "style"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            className={styles.filter}
            onClick={() => setFilter(item)}
          >
            {item}{" "}
            {
              remaining.filter((note) => item === "all" || note.type === item)
                .length
            }
          </button>
        ))}
      </div>
      {actionError && <p role="alert">{actionError}</p>}
      {remaining
        .filter((note) => filter === "all" || note.type === filter)
        .map((note) => (
          <GrammarNote
            key={note.id}
            note={note}
            onResolve={(action) => void resolve(note.id, action)}
          />
        ))}
      {remaining.length > 0 && (
        <button
          type="button"
          className={`${styles.pill} ${styles.punk}`}
          onClick={() =>
            void Promise.all(
              remaining
                .filter((note) => note.type !== "style")
                .map((note) => resolve(note.id, "accept")),
            )
          }
        >
          Accept all spelling and grammar
        </button>
      )}
    </div>
  );
}
