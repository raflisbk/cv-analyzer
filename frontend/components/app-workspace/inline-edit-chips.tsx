import { useT } from "@/components/i18n/i18n-provider";
import styles from "./workspace-styles";

const chips = [
  ["shorter", "Make this shorter"],
  [
    "addNumbers",
    "Suggest where a user-provided number would clarify this. Use a placeholder, never invent a number.",
  ],
  ["strongerVerb", "Use a stronger action verb without adding facts"],
];
export function InlineEditChips({
  request,
}: {
  request: (instruction: string) => void;
}) {
  const { t } = useT();
  return (
    <div className={styles.row}>
      {chips.map(([label, instruction]) => (
        <button
          key={label}
          type="button"
          className={`${styles.pill} ${styles.snow}`}
          onClick={() => request(instruction)}
        >
          {t(`appWorkspace.inline.${label}`)}
        </button>
      ))}
    </div>
  );
}
