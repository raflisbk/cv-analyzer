/**
 * Zustand store untuk workspace-v2.
 * Phase 13: grid-based layout state - activeDetailTab drives left panel expansion.
 * null = PDF-first mode (left compact), string = detail tab active (PDF hidden).
 * Phase 14: activeSuggestionId tracks which suggestion card is highlighted.
 * Jangan gunakan persist middleware - Yjs menangani persistence.
 */
"use client";
import { create } from "zustand";
import type { WorkspaceHydration } from "@/lib/workspace";

interface WorkspaceV2State {
  // PDF state
  pdfUrl: string | null;
  viewMode: "optimized" | "original"; // PDF-03: default optimized

  // Layout state - null = PDF-first, string = detail focus on that tab
  activeDetailTab: string | null;

  // Phase 14: tracks which suggestion annotation is active/highlighted
  activeSuggestionId: string | null;

  // Job context
  jobId: string;
  hydration: WorkspaceHydration | null;

  // Actions
  setPdfUrl: (url: string | null) => void;
  setViewMode: (mode: "optimized" | "original") => void;
  setActiveDetailTab: (tab: string | null) => void;
  setActiveSuggestionId: (id: string | null) => void;
  setJobId: (jobId: string) => void;
  setHydration: (hydration: WorkspaceHydration) => void;
}

export const useWorkspaceV2Store = create<WorkspaceV2State>((set) => ({
  pdfUrl: null,
  viewMode: "optimized",      // PDF-03: workspace defaults to optimized PDF view
  activeDetailTab: null,      // default PDF-first mode
  activeSuggestionId: null,   // Phase 14: no active suggestion by default
  jobId: "",
  hydration: null,

  setPdfUrl: (url) => set({ pdfUrl: url }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
  setActiveSuggestionId: (id) => set({ activeSuggestionId: id }),
  setJobId: (jobId) => set({ jobId }),
  setHydration: (hydration) => set({ hydration }),
}));