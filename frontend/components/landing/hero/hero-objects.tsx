import Image from "next/image";
import { HERO_OBJECTS, HERO_STICKERS } from "@/lib/landing-hero-layout";
import styles from "./hero-objects.module.css";

export default function HeroObjects() {
  return (
    <div
      className={styles.stage}
      role="img"
      aria-label="CV analysis finds an ATS-ready header, impact in experience, and a skill gap"
    >
      <div className={styles.sheet} data-hero-object>
        <Image
          src={`/landing/3d/${HERO_OBJECTS[0].asset}.webp`}
          alt=""
          fill
          sizes="(max-width: 768px) 220px, 400px"
        />
      </div>
      {HERO_STICKERS.map((item) => (
        <span
          key={item.name}
          className={`${styles.callout} ${styles[item.name]}`}
          data-hero-sticker
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}
