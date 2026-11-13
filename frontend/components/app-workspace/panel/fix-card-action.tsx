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
}

export function FixCardAction({
  fix,
  inputs,
  answers,
  value,
  requiresNumber,
  onApply,
  setError,
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
  return (
    <button
      type="button"
      className={`${styles.pill} ${styles.punk}`}
      onClick={(event) => apply(event.currentTarget)}
    >
      Apply
    </button>
  );
}
