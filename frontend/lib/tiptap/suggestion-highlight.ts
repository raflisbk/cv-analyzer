import { Mark } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export const SuggestionHighlight = Mark.create({
  name: "suggestionHighlight",

  // Allow coexistence with bold/italic marks
  excludes: "",

  addAttributes() {
    return {
      suggestionId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-suggestion-id"),
        renderHTML: (attributes) => ({
          "data-suggestion-id": attributes.suggestionId,
        }),
      },
      color: {
        default: "#CAFF43",
        parseHTML: (element) => element.getAttribute("data-color"),
        renderHTML: (attributes) => ({
          "data-color": attributes.color,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "mark[data-suggestion-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const bgColor = (HTMLAttributes["data-color"] as string) ?? "#CAFF43";
    // 66 hex = 40% opacity — stabilo effect per D-06
    return [
      "mark",
      {
        "data-suggestion-id": HTMLAttributes["data-suggestion-id"],
        "data-color": bgColor,
        style: `background-color: ${bgColor}66; border-radius: 2px; cursor: pointer;`,
        class: "suggestion-highlight",
        role: "mark",
        "aria-label": `AI suggestion`,
      },
      0, // 0 = render child content here
    ];
  },

  addCommands() {
    return {
      setSuggestionHighlight:
        (attrs: { suggestionId: string; color: string }) =>
        ({ commands }) => {
          return commands.setMark(this.name, attrs);
        },
      unsetSuggestionHighlight:
        (suggestionId: string) =>
        ({ state, dispatch }) => {
          const { doc, tr } = state;
          let changed = false;
          doc.descendants((node: ProseMirrorNode, pos: number) => {
            if (!node.isText) return;
            node.marks.forEach((mark) => {
              if (
                mark.type.name === "suggestionHighlight" &&
                mark.attrs.suggestionId === suggestionId
              ) {
                tr.removeMark(pos, pos + node.nodeSize, mark.type);
                changed = true;
              }
            });
          });
          if (changed && dispatch) dispatch(tr);
          return changed;
        },
    };
  },
});

// TypeScript command type augmentation
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    suggestionHighlight: {
      setSuggestionHighlight: (attrs: {
        suggestionId: string;
        color: string;
      }) => ReturnType;
      unsetSuggestionHighlight: (suggestionId: string) => ReturnType;
    };
  }
}
