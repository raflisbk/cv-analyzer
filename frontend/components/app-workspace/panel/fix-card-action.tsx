import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  const apply = (anchor: HTMLElement) => {
    const text = inputs.length
      ? fillInputs(fix.after, inputs, answers)
      : requiresNumber
        ? fillNumber(fix.after, value)
        : fix.after;
    if (!text) {
      setError(t("appWorkspacePanel.fixes.invalidNumber"));
      return;
    }
    if (!onApply(text, anchor, answers)) {
      setError(t("appWorkspacePanel.fixes.applyFailed"));
    }
  };
  if (!fix.after) {
    return (
      <button
        type="button"
        className={`${styles.pill} ${styles.punk}`}
        onClick={() => onShow(fix.id, fix.section)}
      >
        {t("appWorkspacePanel.fixes.editYourself")}
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
      {t("appWorkspacePanel.fixes.apply")}
    </button>
  );
}
