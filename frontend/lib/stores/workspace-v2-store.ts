/**
 * Zustand store untuk workspace-v2.
 * Phase 13: grid-based layout state — activeDetailTab drives left panel expansion.
 * null = PDF-first mode (left compact), string = detail tab active (PDF hidden).
 * Jangan gunakan persist middleware — Yjs menangani persistence.
 */
"use client";
import { create } from "zustand";
import type { WorkspaceHydration } from "@/lib/workspace";

interface WorkspaceV2State {
  // PDF state
  pdfUrl: string | null;
  viewMode: "optimized" | "original"; // PDF-03: default optimized

  // Layout state — null = PDF-first, string = detail focus on that tab
  activeDetailTab: string | null;

  // Job context
  jobId: string;
  hydration: WorkspaceHydration | null;

  // Actions
  setPdfUrl: (url: string | null) => void;
  setViewMode: (mode: "optimized" | "original") => void;
  setActiveDetailTab: (tab: string | null) => void;
  setJobId: (jobId: string) => void;
  setHydration: (hydration: WorkspaceHydration) => void;
}

export const useWorkspaceV2Store = create<WorkspaceV2State>((set) => ({
  pdfUrl: null,
  viewMode: "optimized",      // PDF-03: workspace defaults ke optimized PDF view
  activeDetailTab: null,      // default PDF-first mode
  jobId: "",
  hydration: null,

  setPdfUrl: (url) => set({ pdfUrl: url }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
  setJobId: (jobId) => set({ jobId }),
  setHydration: (hydration) => set({ hydration }),
}));
