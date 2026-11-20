import { useT } from "@/components/i18n/i18n-provider";
import type { TourStep } from "@/lib/pathy/tours";
import styles from "./pathy.module.css";
import PathyTourControls from "./pathy-tour-controls";
import PathyTourStory from "./pathy-tour-story";

interface PathyTourCardProps {
  step: TourStep;
  tourName: string;
  index: number;
  total: number;
  missing: boolean;
  back: () => void;
  next: () => void;
  close: () => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
}

export default function PathyTourCard({
  step,
  tourName,
  index,
  total,
  missing,
  back,
  next,
  close,
  innerRef,
}: PathyTourCardProps) {
  const { t } = useT();
  return (
    <div
      ref={innerRef}
      className={styles.tourCard}
      role="dialog"
      aria-modal="true"
      aria-label={t("pathy.ui.tourLabel")}
    >
      <PathyTourStory
        step={step}
        tourName={tourName}
        index={index}
        total={total}
        missing={missing}
      />
      <PathyTourControls
        index={index}
        total={total}
        back={back}
        next={next}
        close={close}
      />
    </div>
  );
}
