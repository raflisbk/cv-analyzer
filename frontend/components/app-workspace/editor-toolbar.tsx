import type { Editor } from "@tiptap/core";
import HelpButton from "@/components/pathy/help-button";
import styles from "./workspace-styles";

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
      <button
        type="button"
        className={styles.tool}
        aria-label="Bold"
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        type="button"
        className={styles.tool}
        aria-label="Italic"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className={styles.tool}
        aria-label="Undo"
        onClick={() => editor?.chain().focus().undo().run()}
      >
        ↶
      </button>
      <button
        type="button"
        className={styles.tool}
        aria-label="Redo"
        onClick={() => editor?.chain().focus().redo().run()}
      >
        ↷
      </button>
      <span className={styles.note}>select text, ask AI</span>
      <HelpButton helpKey="editor" />
    </div>
  );
}
