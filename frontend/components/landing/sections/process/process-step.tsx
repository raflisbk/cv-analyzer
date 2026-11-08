import Image from "next/image";
import { processSteps } from "@/lib/landing-process";
import base from "../section.module.css";
import styles from "./process.module.css";

export default function ProcessStep({
  step,
  index,
}: {
  step: (typeof processSteps)[number];
  index: number;
}) {
  return (
    <article className={styles.item}>
      <div className={styles.text}>
        <span className={styles.number}>{index + 1}</span>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
      <div className={styles.visual}>
        <Image
          width={360}
          height={360}
          className={base.object}
          src={`/landing/3d/${step.image}.webp`}
          alt=""
          aria-hidden="true"
        />
        <span className={styles.sticker}>{step.sticker}</span>
      </div>
    </article>
  );
}
