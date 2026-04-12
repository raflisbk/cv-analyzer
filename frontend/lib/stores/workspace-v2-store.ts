/**
 * Zustand store untuk workspace-v2.
 * Phase 13: state minimal — leftPanelOpen, pdfUrl, viewMode, hydration context.
 * Jangan gunakan persist middleware — Yjs menangani persistence.
 */
"use client";
import { create } from "zustand";
import type { WorkspaceHydration } from "@/lib/workspace";

interface WorkspaceV2State {
  // PDF state
  pdfUrl: string | null;
  viewMode: "optimized" | "original"; // PDF-03: default optimized

  // Layout state
  leftPanelOpen: boolean; // CONTEXT.md: collapsed by default = false

  // Job context
  jobId: string;
  hydration: WorkspaceHydration | null;

  // Actions
  setPdfUrl: (url: string | null) => void;
  setViewMode: (mode: "optimized" | "original") => void;
  toggleLeftPanel: () => void;
  setJobId: (jobId: string) => void;
  setHydration: (hydration: WorkspaceHydration) => void;
}

export const useWorkspaceV2Store = create<WorkspaceV2State>((set) => ({
  pdfUrl: null,
  viewMode: "optimized",   // PDF-03: workspace defaults ke optimized PDF view
  leftPanelOpen: false,    // CONTEXT.md D-01: collapsed by default
  jobId: "",
  hydration: null,

  setPdfUrl: (url) => set({ pdfUrl: url }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  setJobId: (jobId) => set({ jobId }),
  setHydration: (hydration) => set({ hydration }),
}));
