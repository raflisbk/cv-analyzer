import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import type { HelpContent } from "@/lib/pathy/help-content";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import styles from "./help.module.css";

export default function HelpCard({
  content,
  helpKey,
  close,
  tour,
  innerRef,
}: {
  content: HelpContent;
  helpKey: string;
  close: () => void;
  tour: () => void;
  innerRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const { t } = useT();
  const title = t(`pathy.help.${helpKey}.title`);
  return (
    <span
      ref={innerRef}
      className={styles.helpCard}
      role="dialog"
      aria-label={title}
    >
      <Image
        src={pathyPoseSrc(content.pose)}
        alt=""
        width={64}
        height={64}
        unoptimized
      />
      <strong>{title}</strong>
      <span>{t(`pathy.help.${helpKey}.text`)}</span>
      <span className={styles.helpActions}>
        <button onClick={close}>{t("pathy.ui.gotIt")}</button>
        <button onClick={tour}>{t("pathy.ui.showTour")}</button>
      </span>
    </span>
  );
}
