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
  return (
    <>
      {inputs.map(({ token, question }) => (
        <label key={token}>
          {question}
          <input
            className={styles.input}
            value={answers[token] ?? ""}
            onChange={(event) =>
              setAnswers((current) => ({
                ...current,
                [token]: event.target.value,
              }))
            }
          />
        </label>
      ))}
    </>
  );
}
