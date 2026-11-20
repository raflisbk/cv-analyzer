import type { Editor } from "@tiptap/core";
import { useT } from "@/components/i18n/i18n-provider";
import HelpButton from "@/components/pathy/help-button";
import styles from "./workspace-styles";

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const { t } = useT();
  return (
    <div
      className={styles.toolbar}
      role="toolbar"
      aria-label={t("appWorkspace.toolbar.label")}
    >
      <button
        type="button"
        className={styles.tool}
        aria-label={t("appWorkspace.toolbar.bold")}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        B
      </button>
      <button
        type="button"
        className={styles.tool}
        aria-label={t("appWorkspace.toolbar.italic")}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        className={styles.tool}
        aria-label={t("appWorkspace.toolbar.undo")}
        onClick={() => editor?.chain().focus().undo().run()}
      >
        ↶
      </button>
      <button
        type="button"
        className={styles.tool}
        aria-label={t("appWorkspace.toolbar.redo")}
        onClick={() => editor?.chain().focus().redo().run()}
      >
        ↷
      </button>
      <span className={styles.note}>{t("appWorkspace.toolbar.hint")}</span>
      <HelpButton helpKey="editor" />
    </div>
  );
}
