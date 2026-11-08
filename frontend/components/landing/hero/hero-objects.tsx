import Image from "next/image";
import { HERO_OBJECTS, HERO_STICKERS } from "@/lib/landing-hero-layout";
import styles from "./hero-objects.module.css";

export default function HeroObjects() {
  return (
    <div className={styles.stage} aria-hidden="true" data-hero-stage>
      {HERO_OBJECTS.map((item) => (
        <div
          key={item.name}
          className={`${styles.object} ${styles[item.name]}`}
          data-hero-object
        >
          <div
            className={styles.float}
            style={{ animationDelay: `${item.delay}s` }}
          >
            <Image
              src={`/landing/3d/${item.asset}.webp`}
              alt=""
              fill
              sizes="(max-width: 768px) 150px, 300px"
            />
          </div>
        </div>
      ))}
      {HERO_STICKERS.map((item) => (
        <span
          key={item.label}
          className={`${styles.sticker} ${styles[item.name]}`}
          data-hero-sticker
        >
          {item.label}
        </span>
      ))}
      <span className={styles.note} data-hero-sticker>
        score it. fix it. land it.
      </span>
    </div>
  );
}
