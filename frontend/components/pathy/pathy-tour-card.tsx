import Image from "next/image";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { TourStep } from "@/lib/pathy/tours";
import styles from "./pathy.module.css";

export default function PathyTourCard({
  step,
  index,
  total,
  missing,
  back,
  next,
  close,
  innerRef,
}: {
  step: TourStep;
  index: number;
  total: number;
  missing: boolean;
  back: () => void;
  next: () => void;
  close: () => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={innerRef}
      className={styles.tourCard}
      role="dialog"
      aria-modal="true"
      aria-label="Pathy tour"
    >
      <Image
        src={pathyPoseSrc(step.pose)}
        alt=""
        width={76}
        height={76}
        unoptimized
      />
      <div>
        <small>
          Step {index + 1} of {total}
        </small>
        <h2>{step.title}</h2>
        <p>
          {missing
            ? "This part is not ready yet. Continue to the next step."
            : step.text}
        </p>
      </div>
      <div className={styles.tourActions}>
        <button onClick={back} disabled={index === 0}>
          Back
        </button>
        <button onClick={next}>{index + 1 === total ? "Done" : "Next"}</button>
        <button onClick={close}>Skip</button>
      </div>
      <div className={styles.dots} aria-label="Tour progress">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-active={i === index} />
        ))}
      </div>
    </div>
  );
}
