import type { TourStep } from "@/lib/pathy/tours";
import styles from "./pathy.module.css";
import PathyTourControls from "./pathy-tour-controls";
import PathyTourStory from "./pathy-tour-story";

interface PathyTourCardProps {
  step: TourStep;
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
  index,
  total,
  missing,
  back,
  next,
  close,
  innerRef,
}: PathyTourCardProps) {
  return (
    <div
      ref={innerRef}
      className={styles.tourCard}
      role="dialog"
      aria-modal="true"
      aria-label="Pathy tour"
    >
      <PathyTourStory
        step={step}
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
