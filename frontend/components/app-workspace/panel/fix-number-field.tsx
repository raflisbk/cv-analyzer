import { useT } from "@/components/i18n/i18n-provider";
import styles from "../workspace-styles";

export function FixNumberField({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) {
  const { t } = useT();
  return (
    <label>
      {t("appWorkspacePanel.fixes.enterNumber")}
      <input
        className={styles.input}
        inputMode="decimal"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("appWorkspacePanel.fixes.numberPlaceholder")}
      />
    </label>
  );
}
