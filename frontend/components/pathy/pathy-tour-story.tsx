import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import { pathyPoseSrc } from "@/lib/pathy/pose";
import type { TourStep } from "@/lib/pathy/tours";

export default function PathyTourStory({
  step,
  tourName,
  index,
  total,
  missing,
}: {
  step: TourStep;
  tourName: string;
  index: number;
  total: number;
  missing: boolean;
}) {
  const { t } = useT();
  const key = `pathy.tour.${tourName}.s${index}`;
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
        <small>{t("pathy.ui.step", { index: index + 1, total })}</small>
        <h2>{t(`${key}.title`)}</h2>
        <p>{missing ? t("pathy.ui.missing") : t(`${key}.text`)}</p>
      </div>
    </>
  );
}
