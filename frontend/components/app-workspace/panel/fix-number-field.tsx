import styles from "../workspace-styles";

export function FixNumberField({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <label>
      Enter the number from your experience
      <input
        className={styles.input}
        inputMode="decimal"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Your number"
      />
    </label>
  );
}
