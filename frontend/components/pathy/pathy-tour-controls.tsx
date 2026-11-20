import { useT } from "@/components/i18n/i18n-provider";
import styles from "./pathy.module.css";

export default function PathyTourControls({
  index,
  total,
  back,
  next,
  close,
}: {
  index: number;
  total: number;
  back: () => void;
  next: () => void;
  close: () => void;
}) {
  const { t } = useT();
  return (
    <>
      <div className={styles.tourActions}>
        <button onClick={back} disabled={index === 0}>
          {t("pathy.ui.back")}
        </button>
        <button onClick={next}>
          {index + 1 === total ? t("pathy.ui.done") : t("pathy.ui.next")}
        </button>
        <button onClick={close}>{t("pathy.ui.skip")}</button>
      </div>
      <div className={styles.dots} aria-label={t("pathy.ui.progress")}>
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-active={i === index} />
        ))}
      </div>
    </>
  );
}
