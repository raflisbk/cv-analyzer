import { describe, expect, it } from "vitest";
import {
  artifactMessageIds,
  matchesArtifactIntent,
} from "@/lib/chat-artifact-intent";

describe("matchesArtifactIntent", () => {
  it.each([
    "Skor CV kamu",
    "Kenapa skor aku rendah?",
    "kenapa sih skor gua kok 74 bro",
    "terus apa yang bisa gua improve untuk naikin score gua",
    "Gimana cara menaikkan nilai CV aku?",
    "tolong perbaiki bullet ini",
    "How can I raise my CV score?",
    "Why is my CV so weak? Why is it low?",
    "What should I fix first?",
    "how do I increase my rating",
  ])("matches %s", (text) => {
    expect(matchesArtifactIntent(text)).toBe(true);
  });

  it.each([
    "Cocokkan ke lowongan",
    "Match it to a job",
    "How should I prepare for an interview?",
    "halo",
    "",
  ])("ignores %j", (text) => {
    expect(matchesArtifactIntent(text)).toBe(false);
  });
});

describe("artifactMessageIds", () => {
  it("flags the assistant reply that follows a matching question", () => {
    const ids = artifactMessageIds([
      { id: "u1", role: "user", text: "kenapa skor aku rendah?" },
      { id: "a1", role: "assistant", text: "Karena ..." },
      { id: "u2", role: "user", text: "makasih" },
      { id: "a2", role: "assistant", text: "Sama-sama" },
    ]);
    expect([...ids]).toEqual(["a1"]);
  });

  it("skips replies that are still empty", () => {
    const ids = artifactMessageIds([
      { id: "u1", role: "user", text: "skor aku berapa" },
      { id: "a1", role: "assistant", text: "" },
    ]);
    expect(ids.size).toBe(0);
  });
});
