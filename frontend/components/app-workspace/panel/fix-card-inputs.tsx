import { useT } from "@/components/i18n/i18n-provider";
import { resolveFixQuestion } from "@/lib/app-workspace/fix-questions";
import type { FixInput } from "@/lib/app-workspace/fixes";
import styles from "../workspace-styles";

export function FixCardInputs({
  inputs,
  answers,
  setAnswers,
}: {
  inputs: FixInput[];
  answers: Record<string, string>;
  setAnswers: (
    update: (current: Record<string, string>) => Record<string, string>,
  ) => void;
}) {
  const { t } = useT();
  return (
    <>
      {inputs.map((input) => {
        const { token } = input;
        return (
          <label key={token}>
            {resolveFixQuestion(input, t)}
            <input
              className={styles.input}
              placeholder={t("appWorkspacePanel.fixes.answerPlaceholder")}
              value={answers[token] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [token]: event.target.value,
                }))
              }
            />
          </label>
        );
      })}
    </>
  );
}
