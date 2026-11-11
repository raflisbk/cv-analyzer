import styles from "./workspace-styles";

const chips = [
  ["Shorter", "Make this shorter"],
  [
    "Add numbers",
    "Suggest where a user-provided number would clarify this. Use a placeholder, never invent a number.",
  ],
  ["Stronger verb", "Use a stronger action verb without adding facts"],
];
export function InlineEditChips({
  request,
}: {
  request: (instruction: string) => void;
}) {
  return (
    <div className={styles.row}>
      {chips.map(([label, instruction]) => (
        <button
          key={label}
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => request(instruction)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
