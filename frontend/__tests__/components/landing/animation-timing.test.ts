import { describe, expect, test } from "vitest";
import {
  CARD_PUNCH_ROTATION_MS,
  CARD_PUNCH_X_SETTLE_MS,
  HERO_INTRO_FALLBACK_MS,
} from "@/components/landing/hero-section";
import { REDUCED_MOTION_QUERY as SCROLL_REVEAL_MOTION_QUERY } from "@/components/landing/scroll-reveal";
import { REDUCED_MOTION_QUERY as STATS_MOTION_QUERY } from "@/components/landing/stats-section";
import { RAG_BURST_DECAY } from "@/components/landing/rag-graph";
import {
  callOnce,
  MASCOT_INTRO_MAX_MS,
  MASCOT_PHYSICS_MAX_MS,
  MASCOT_ZONE_MAX_MS,
} from "@/components/landing/hero-mascot";

describe("landing animation timing", () => {
  test("reveals the hero within the short fallback window", () => {
    expect(HERO_INTRO_FALLBACK_MS).toBe(700);
  });

  test("restores the full hard-strike punch sequence", () => {
    expect(CARD_PUNCH_ROTATION_MS).toBe(2400);
    expect(CARD_PUNCH_X_SETTLE_MS).toBe(1500);
  });

  test("bounds the mascot intro physics", () => {
    expect(MASCOT_INTRO_MAX_MS).toBe(7000);
  });

  test("keeps a generous zone physics watchdog", () => {
    expect(MASCOT_PHYSICS_MAX_MS).toBe(6500);
    expect(MASCOT_ZONE_MAX_MS).toBe(9000);
  });

  test("calls a landing callback only once", () => {
    const calls: number[] = [];
    const onLand = callOnce((impact: number) => calls.push(impact));

    onLand(1);
    onLand(2);

    expect(calls).toEqual([1]);
  });

  test("uses the shared reduced-motion media query", () => {
    expect(SCROLL_REVEAL_MOTION_QUERY).toBe(
      "(prefers-reduced-motion: no-preference)",
    );
    expect(STATS_MOTION_QUERY).toBe(SCROLL_REVEAL_MOTION_QUERY);
  });

  test("uses the shorter RAG burst decay", () => {
    expect(RAG_BURST_DECAY).toBe(1.4);
  });
});
