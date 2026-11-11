import styles from "./workspace-styles";

export function ScrollMore({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  if (!visible) {
    return null;
  }
  return (
    <button className={styles.more} type="button" onClick={onClick}>
      More ↓
    </button>
  );
}
