
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
  pdfUrl: string | null;
  viewMode: "optimized" | "original";

  activeDetailTab: string | null;

  activeSuggestionId: string | null;

  suggestionStatuses: Record<string, SuggestionStatus>;

  cvDocument: Record<string, any> | null;

  chatMessages: ChatMessage[];
  isChatStreaming: boolean;

  jobId: string;
  hydration: WorkspaceHydration | null;

  setPdfUrl: (url: string | null) => void;
  setViewMode: (mode: "optimized" | "original") => void;
  setActiveDetailTab: (tab: string | null) => void;
  setActiveSuggestionId: (id: string | null) => void;
  setSuggestionStatus: (id: string, status: SuggestionStatus) => void;
  applyAllSuggestions: () => void;
  applyInlineEdit: (
    editId: string,
    originalText: string,
    rewrittenText: string,
    rectPercent?: { left: number; top: number; width: number; height: number }
  ) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;
  setChatStreaming: (streaming: boolean) => void;
  clearChatMessages: () => void;
  setJobId: (jobId: string) => void;
  setHydration: (hydration: WorkspaceHydration) => void;
}

export const useWorkspaceV2Store = create<WorkspaceV2State>((set) => ({
  pdfUrl: null,
  viewMode: "optimized",
  activeDetailTab: null,
  activeSuggestionId: null,
  suggestionStatuses: {},
  cvDocument: null,
  chatMessages: [],
  isChatStreaming: false,
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
  applyInlineEdit: (editId, originalText, rewrittenText, rectPercent) =>
    set((state) => {
      const currentDoc = state.cvDocument || {};
      return {
        cvDocument: {
          ...currentDoc,
          [editId]: {
            originalText,
            rewrittenText,
            rectPercent,
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