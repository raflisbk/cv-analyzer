import { Mark } from "@tiptap/core";

export interface SuggestionAttributes {
  suggestionId: string;
  priority: "high_impact" | "quick_win";
  section: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    suggestionMark: {
      setSuggestion: (attributes: SuggestionAttributes) => ReturnType;
      unsetSuggestion: () => ReturnType;
    };
  }
}

export const SuggestionMark = Mark.create({
  name: "suggestionMark",

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-suggestion-id"),
        renderHTML: (attributes) => {
          if (!attributes.suggestionId) {
            return {};
          }
          return {
            "data-suggestion-id": attributes.suggestionId,
          };
        },
      },
      priority: {
        default: "quick_win",
        parseHTML: (element) => element.getAttribute("data-priority") as SuggestionAttributes["priority"],
        renderHTML: (attributes) => {
          if (!attributes.priority) {
            return {};
          }
          return {
            "data-priority": attributes.priority,
          };
        },
      },
      section: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-section"),
        renderHTML: (attributes) => {
          if (!attributes.section) {
            return {};
          }
          return {
            "data-section": attributes.section,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-suggestion-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const priority = HTMLAttributes["data-priority"] || "quick_win";
    const color = priority === "high_impact"
      ? { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)" }
      : { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.5)" };

    return [
      "span",
      {
        ...HTMLAttributes,
        style: `background: ${color.bg}; border-bottom: 2px solid ${color.border}; border-radius: 2px; cursor: pointer; padding: 2px 0;`,
        class: "suggestion-highlight",
      },
      0,
    ];
  },

  addCommands() {
    return {
      setSuggestion:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetSuggestion:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
