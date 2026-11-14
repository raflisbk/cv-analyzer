import Image from "next/image";
import { features } from "@/lib/landing-features";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";
import base from "../section.module.css";
import styles from "./features.module.css";

export default function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const description =
    feature.title === "Real scoring"
      ? `${formatLandingCount(landingFacts.scoreDimensions)} scored dimensions, with a plain reason for every score.`
      : feature.description;
  return (
    <article className={`${styles.card} ${styles[`card${index}`]}`}>
      <h3>{feature.title}</h3>
      <p>{description}</p>
      <Image
        width={360}
        height={360}
        className={base.object}
        src={`/landing/3d/${feature.image}.webp`}
        alt=""
        aria-hidden="true"
      />
    </article>
  );
}
