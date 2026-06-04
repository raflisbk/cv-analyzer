import { describe, it, expect, beforeEach } from "vitest";
import {
  useWorkspaceV2Store,
  type SuggestionStatus,
} from "@/lib/stores/workspace-v2-store";
import type { WorkspaceHydration } from "@/lib/workspace";

describe("workspace-v2-store", () => {
  beforeEach(() => {
    const store = useWorkspaceV2Store.getState();
    useWorkspaceV2Store.setState({
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
    });
  });

  it("has correct initial state", () => {
    const state = useWorkspaceV2Store.getState();
    expect(state.pdfUrl).toBeNull();
    expect(state.viewMode).toBe("optimized");
    expect(state.activeDetailTab).toBeNull();
    expect(state.activeSuggestionId).toBeNull();
    expect(state.suggestionStatuses).toEqual({});
    expect(state.cvDocument).toBeNull();
    expect(state.chatMessages).toEqual([]);
    expect(state.isChatStreaming).toBe(false);
    expect(state.jobId).toBe("");
    expect(state.hydration).toBeNull();
  });

  describe("setPdfUrl", () => {
    it("sets PDF URL", () => {
      useWorkspaceV2Store.getState().setPdfUrl("http://example.com/file.pdf");
      expect(useWorkspaceV2Store.getState().pdfUrl).toBe("http://example.com/file.pdf");
    });

    it("can set to null", () => {
      useWorkspaceV2Store.getState().setPdfUrl("http://example.com/file.pdf");
      useWorkspaceV2Store.getState().setPdfUrl(null);
      expect(useWorkspaceV2Store.getState().pdfUrl).toBeNull();
    });
  });

  describe("setViewMode", () => {
    it("switches view mode", () => {
      useWorkspaceV2Store.getState().setViewMode("original");
      expect(useWorkspaceV2Store.getState().viewMode).toBe("original");

      useWorkspaceV2Store.getState().setViewMode("optimized");
      expect(useWorkspaceV2Store.getState().viewMode).toBe("optimized");
    });
  });

  describe("setActiveDetailTab", () => {
    it("sets active detail tab", () => {
      useWorkspaceV2Store.getState().setActiveDetailTab("suggestions");
      expect(useWorkspaceV2Store.getState().activeDetailTab).toBe("suggestions");
    });

    it("clears tab with null", () => {
      useWorkspaceV2Store.getState().setActiveDetailTab("suggestions");
      useWorkspaceV2Store.getState().setActiveDetailTab(null);
      expect(useWorkspaceV2Store.getState().activeDetailTab).toBeNull();
    });
  });

  describe("setActiveSuggestionId", () => {
    it("sets active suggestion ID", () => {
      useWorkspaceV2Store.getState().setActiveSuggestionId("sug-1");
      expect(useWorkspaceV2Store.getState().activeSuggestionId).toBe("sug-1");
    });
  });

  describe("suggestionStatuses", () => {
    it("sets individual suggestion status", () => {
      useWorkspaceV2Store.getState().setSuggestionStatus("sug-1", "applied");
      expect(useWorkspaceV2Store.getState().suggestionStatuses["sug-1"]).toBe("applied");
    });

    it("can update status multiple times", () => {
      const store = useWorkspaceV2Store.getState();
      store.setSuggestionStatus("sug-1", "applied");
      store.setSuggestionStatus("sug-2", "dismissed");
      store.setSuggestionStatus("sug-1", "dismissed");

      const state = useWorkspaceV2Store.getState();
      expect(state.suggestionStatuses["sug-1"]).toBe("dismissed");
      expect(state.suggestionStatuses["sug-2"]).toBe("dismissed");
    });
  });

  describe("applyAllSuggestions", () => {
    it("applies all pending suggestions", () => {
      const hydration = {
        suggestion_anchors: [
          { suggestion_id: "sug-1", section: "exp", text_anchor: "test", page_index: 0, rect: { x: 0, y: 0, w: 10, h: 10 }, priority: "high_impact" as const },
          { suggestion_id: "sug-2", section: "exp", text_anchor: "test2", page_index: 0, rect: { x: 0, y: 0, w: 10, h: 10 }, priority: "quick_win" as const },
        ],
      } as unknown as WorkspaceHydration;

      useWorkspaceV2Store.getState().setHydration(hydration);
      useWorkspaceV2Store.getState().applyAllSuggestions();

      const state = useWorkspaceV2Store.getState();
      expect(state.suggestionStatuses["sug-1"]).toBe("applied");
      expect(state.suggestionStatuses["sug-2"]).toBe("applied");
    });

    it("does not override already-applied suggestions", () => {
      const hydration = {
        suggestion_anchors: [
          { suggestion_id: "sug-1", section: "exp", text_anchor: "test", page_index: 0, rect: { x: 0, y: 0, w: 10, h: 10 }, priority: "high_impact" as const },
        ],
      } as unknown as WorkspaceHydration;

      useWorkspaceV2Store.getState().setHydration(hydration);
      useWorkspaceV2Store.getState().setSuggestionStatus("sug-1", "dismissed");
      useWorkspaceV2Store.getState().applyAllSuggestions();

      expect(useWorkspaceV2Store.getState().suggestionStatuses["sug-1"]).toBe("dismissed");
    });
  });

  describe("applyInlineEdit", () => {
    it("stores inline edit in cvDocument", () => {
      useWorkspaceV2Store.getState().applyInlineEdit("edit-1", "original text", "rewritten text");
      const doc = useWorkspaceV2Store.getState().cvDocument as Record<string, Record<string, unknown>>;
      expect(doc).not.toBeNull();
      expect(doc!["edit-1"].originalText).toBe("original text");
      expect(doc!["edit-1"].rewrittenText).toBe("rewritten text");
    });

    it("stores rect percent when provided", () => {
      const rect = { left: 10, top: 20, width: 30, height: 5 };
      useWorkspaceV2Store.getState().applyInlineEdit("edit-2", "old", "new", rect);
      expect((useWorkspaceV2Store.getState().cvDocument as Record<string, Record<string, unknown>>)!["edit-2"].rectPercent).toEqual(rect);
    });
  });

  describe("chat", () => {
    it("adds chat message", () => {
      useWorkspaceV2Store.getState().addChatMessage({
        timestamp: new Date().toISOString(),
        role: "user",
        content: "Hello",
        status: "complete",
      });

      expect(useWorkspaceV2Store.getState().chatMessages).toHaveLength(1);
      expect(useWorkspaceV2Store.getState().chatMessages[0].content).toBe("Hello");
    });

    it("updates last assistant message", () => {
      useWorkspaceV2Store.getState().addChatMessage({
        timestamp: new Date().toISOString(),
        role: "assistant",
        content: "Hello",
        status: "streaming",
      });

      useWorkspaceV2Store.getState().updateLastChatMessage(" world");
      expect(useWorkspaceV2Store.getState().chatMessages[0].content).toBe("Hello world");
    });

    it("does not update last message if it is not assistant", () => {
      useWorkspaceV2Store.getState().addChatMessage({
        timestamp: new Date().toISOString(),
        role: "user",
        content: "Hello",
        status: "complete",
      });

      useWorkspaceV2Store.getState().updateLastChatMessage(" world");
      expect(useWorkspaceV2Store.getState().chatMessages[0].content).toBe("Hello");
    });

    it("sets chat streaming state", () => {
      useWorkspaceV2Store.getState().setChatStreaming(true);
      expect(useWorkspaceV2Store.getState().isChatStreaming).toBe(true);

      useWorkspaceV2Store.getState().setChatStreaming(false);
      expect(useWorkspaceV2Store.getState().isChatStreaming).toBe(false);
    });

    it("clears chat messages", () => {
      useWorkspaceV2Store.getState().addChatMessage({
        timestamp: new Date().toISOString(),
        role: "user",
        content: "Hello",
        status: "complete",
      });

      useWorkspaceV2Store.getState().clearChatMessages();
      expect(useWorkspaceV2Store.getState().chatMessages).toHaveLength(0);
    });
  });

  describe("setJobId / setHydration", () => {
    it("sets job ID", () => {
      useWorkspaceV2Store.getState().setJobId("job-123");
      expect(useWorkspaceV2Store.getState().jobId).toBe("job-123");
    });

    it("sets hydration data", () => {
      const hydration = { job_id: "j1" } as unknown as WorkspaceHydration;
      useWorkspaceV2Store.getState().setHydration(hydration);
      expect(useWorkspaceV2Store.getState().hydration).toEqual(hydration);
    });
  });
});
