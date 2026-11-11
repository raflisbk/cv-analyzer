import type { RefObject } from "react";
import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import styles from "./workspace-styles";

export function EditorFrame({
  frame,
  editor,
  onSelection,
  onHighlight,
}: {
  frame: RefObject<HTMLDivElement | null>;
  editor: Editor | null;
  onSelection: () => void;
  onHighlight: (target: HTMLElement) => void;
}) {
  return (
    <div
      ref={frame}
      className={`${styles.frame} ${styles.editor}`}
      onMouseUp={onSelection}
      onClick={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-fix-id]",
        );
        if (target) {
          onHighlight(target);
        }
      }}
    >
      <EditorContent editor={editor} aria-label="CV editor" />
    </div>
  );
}
