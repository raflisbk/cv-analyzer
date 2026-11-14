import Image from "next/image";
import { formatLandingCount } from "@/lib/landing-facts";
import PenUnderline from "../../pen/pen-underline";
import pen from "../../pen/pen.module.css";
import base from "../section.module.css";
import styles from "./stats.module.css";

type Stat = { value: number; label: string; image: string };
export default function StatItem({ stat }: { stat: Stat }) {
  return (
    <div data-stat className={styles.stat}>
      <Image
        width={360}
        height={360}
        className={base.object}
        src={`/landing/3d/${stat.image}.webp`}
        alt=""
        aria-hidden="true"
      />
      <b data-value={stat.value} data-suffix="">
        {formatLandingCount(stat.value)}
      </b>
      <span>
        {stat.label === "ATS checks" ? (
          <span className={pen.target}>
            ATS checks
            <PenUnderline variant={2} onDark />
          </span>
        ) : (
          stat.label
        )}
      </span>
    </div>
  );
}
