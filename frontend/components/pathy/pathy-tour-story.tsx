import Image from "next/image";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { TourStep } from "@/lib/pathy/tours";

export default function PathyTourStory({
  step,
  index,
  total,
  missing,
}: {
  step: TourStep;
  index: number;
  total: number;
  missing: boolean;
}) {
  return (
    <>
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
    </>
  );
}
