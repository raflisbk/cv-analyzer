import type { WorkspaceFix, FixInput } from "@/lib/app-workspace/fixes";
import { fillInputs, fillNumber } from "@/lib/app-workspace/fixes";
import styles from "../workspace-styles";

interface Props {
  fix: WorkspaceFix;
  inputs: FixInput[];
  answers: Record<string, string>;
  value: string;
  requiresNumber: boolean;
  onApply: (
    text: string,
    anchor: HTMLElement,
    answers: Record<string, string>,
  ) => boolean;
  setError: (message: string) => void;
  onShow: (id: string, section: string) => void;
}

export function FixCardAction({
  fix,
  inputs,
  answers,
  value,
  requiresNumber,
  onApply,
  setError,
  onShow,
}: Props) {
  const apply = (anchor: HTMLElement) => {
    const text = inputs.length
      ? fillInputs(fix.after, inputs, answers)
      : requiresNumber
        ? fillNumber(fix.after, value)
        : fix.after;
    if (!text) {
      setError("Enter a valid number before applying.");
      return;
    }
    if (!onApply(text, anchor, answers)) {
      setError(
        "Could not apply this fix. Check the original text and supplied facts.",
      );
    }
  };
  if (!fix.after) {
    return (
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={() => onShow(fix.id, fix.section)}
      >
        Edit this line yourself
      </button>
    );
  }
  const incomplete = inputs.some(({ token }) => !answers[token]?.trim());
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles.punk}`}
      disabled={incomplete}
      onClick={(event) => apply(event.currentTarget)}
    >
      Apply
    </button>
  );
}
