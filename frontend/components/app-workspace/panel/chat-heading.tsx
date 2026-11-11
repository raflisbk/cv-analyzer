import HelpButton from "@/components/pathy/help-button";
import styles from "../workspace-styles";

export function ChatHeading({ fileName }: { fileName: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.eyebrow}>
        Chat about {fileName} · saved in history
      </span>
      <HelpButton helpKey="chat" />
    </div>
  );
}
