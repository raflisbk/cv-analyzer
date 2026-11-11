import { Mark } from "@tiptap/core";

export const AppSuggestionMark = Mark.create({
  name: "appSuggestion",
  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => ({ "data-label": attributes.label }),
      },
      fixId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-fix-id"),
        renderHTML: (attributes) => ({ "data-fix-id": attributes.fixId }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-fix-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", { ...HTMLAttributes, class: "suggestion-highlight" }, 0];
  },
});
