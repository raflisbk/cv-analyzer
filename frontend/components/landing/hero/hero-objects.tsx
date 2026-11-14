"use client";
import { useRef } from "react";
import { useHeroLines } from "../motion/hero-lines";
import Image from "next/image";
import { HERO_OBJECTS, HERO_STICKERS } from "@/lib/landing-hero-layout";
import styles from "./hero-objects.module.css";
import MarginNote from "../pen/margin-note";

export default function HeroObjects() {
  const ref = useRef<HTMLDivElement>(null);
  useHeroLines(ref);
  return (
    <div ref={ref} className={styles.stage}>
      <div
        className={styles.sheet}
        data-hero-object
        id="hero-cv-sheet"
        aria-describedby="hero-cv-sheet-note"
        role="img"
        aria-label="CV sheet with a bullet missing evidence"
      >
        <Image
          src={`/landing/3d/${HERO_OBJECTS[0].asset}.webp`}
          alt=""
          fill
          sizes="(max-width: 768px) 220px, 400px"
        />
      </div>
      <div className={styles.note}>
        <MarginNote targetId="hero-cv-sheet" variant={2} delay={0.7}>
          No number here
        </MarginNote>
      </div>
      {HERO_STICKERS.map((item) => (
        <span
          key={item.name}
          className={`${styles.callout} ${styles[item.name]}`}
          data-hero-sticker
        >
          {item.label}
          <i data-leader-line aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}
