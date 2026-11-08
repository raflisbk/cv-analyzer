"use client";
import { stickers, stickerObjects } from "@/lib/landing-stickers";
import { useLandingStory } from "@/hooks/use-landing-story";
import { stickersMotion } from "@/components/landing/motion/stickers";
import base from "../section.module.css";
import styles from "./stickers.module.css";
export default function StickersSection() {
  const ref = useLandingStory(stickersMotion);
  return <section ref={ref} id="stickers" className={`${base.panel} ${base.blush} ${styles.section}`}>
    <h2>Why people stick with it</h2>
    <div className={styles.cloud}>{stickers.map((sticker, i) => <span data-sticker className={`${styles.sticker} ${styles[`sticker${i}`]}`} key={sticker}>{sticker}</span>)}</div>
    <div className={styles.objects} aria-hidden="true">{stickerObjects.map((object) => <img className={base.object} key={object} src={`/landing/3d/${object}.webp`} alt="" />)}</div>
  </section>;
}
