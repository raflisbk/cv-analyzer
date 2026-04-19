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

export type SuggestionStatus = "pending" | "applied" | "dismissed";

export type ChatMessage = {
  timestamp: string;
  role: "user" | "assistant";
  content: string;
  status: "complete" | "streaming" | "error";
};

interface WorkspaceV2State {
  // PDF state
  pdfUrl: string | null;
  viewMode: "optimized" | "original"; // PDF-03: default optimized

  // Layout state - null = PDF-first, string = detail focus on that tab
  activeDetailTab: string | null;

  // Phase 14: tracks which suggestion annotation is active/highlighted
  activeSuggestionId: string | null;

  // Phase 14: per-suggestion apply/dismiss status
  suggestionStatuses: Record<string, SuggestionStatus>;

  // Phase 15: inline edit document state
  cvDocument: Record<string, any> | null;

  // Phase 16: Chat state
  chatMessages: ChatMessage[];
  isChatStreaming: boolean;

  // Job context
  jobId: string;
  hydration: WorkspaceHydration | null;

  // Actions
  setPdfUrl: (url: string | null) => void;
  setViewMode: (mode: "optimized" | "original") => void;
  setActiveDetailTab: (tab: string | null) => void;
  setActiveSuggestionId: (id: string | null) => void;
  setSuggestionStatus: (id: string, status: SuggestionStatus) => void;
  applyAllSuggestions: () => void;
  applyInlineEdit: (editId: string, originalText: string, rewrittenText: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;
  setChatStreaming: (streaming: boolean) => void;
  clearChatMessages: () => void;
  setJobId: (jobId: string) => void;
  setHydration: (hydration: WorkspaceHydration) => void;
}

export const useWorkspaceV2Store = create<WorkspaceV2State>((set) => ({
  pdfUrl: null,
  viewMode: "optimized",      // PDF-03: workspace defaults to optimized PDF view
  activeDetailTab: null,      // default PDF-first mode
  activeSuggestionId: null,   // Phase 14: no active suggestion by default
  suggestionStatuses: {},     // Phase 14: all suggestions start as pending
  cvDocument: null,           // Phase 15: optimized document state
  chatMessages: [],           // Phase 16: chat message history
  isChatStreaming: false,     // Phase 16: streaming indicator
  jobId: "",
  hydration: null,

  setPdfUrl: (url) => set({ pdfUrl: url }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
  setActiveSuggestionId: (id) => set({ activeSuggestionId: id }),
  setSuggestionStatus: (id, status) =>
    set((state) => ({
      suggestionStatuses: { ...state.suggestionStatuses, [id]: status },
    })),
  applyAllSuggestions: () =>
    set((state) => {
      const anchors = state.hydration?.suggestion_anchors ?? [];
      const updates: Record<string, SuggestionStatus> = {};
      for (const anchor of anchors) {
        const current = state.suggestionStatuses[anchor.suggestion_id];
        if (!current || current === "pending") {
          updates[anchor.suggestion_id] = "applied";
        }
      }
      return {
        suggestionStatuses: { ...state.suggestionStatuses, ...updates },
      };
    }),
  applyInlineEdit: (editId, originalText, rewrittenText) =>
    set((state) => {
      // Initialize cvDocument if null
      const currentDoc = state.cvDocument || {};
      return {
        cvDocument: {
          ...currentDoc,
          [editId]: {
            originalText,
            rewrittenText,
            appliedAt: new Date().toISOString(),
          },
        },
      };
    }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  updateLastChatMessage: (content) =>
    set((state) => {
      const updated = [...state.chatMessages];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant") {
        last.content += content;
      }
      return { chatMessages: updated };
    }),
  setChatStreaming: (streaming) => set({ isChatStreaming: streaming }),
  clearChatMessages: () => set({ chatMessages: [] }),
  setJobId: (jobId) => set({ jobId }),
  setHydration: (hydration) => set({ hydration }),
}));