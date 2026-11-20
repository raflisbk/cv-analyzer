import { useT } from "@/components/i18n/i18n-provider";
import styles from "./workspace-styles";

export function ScrollMore({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  const { t } = useT();
  if (!visible) {
    return null;
  }
  return (
    <button className={styles.more} type="button" onClick={onClick}>
      {t("appWorkspace.more")}
    </button>
  );
}
