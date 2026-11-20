"use client";

import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import { usePathy } from "@/components/pathy/pathy-context";
import { pathyPoseSrc, type PathyPose } from "@/lib/pathy/pose";
import styles from "./home.module.css";

const quips: [PathyPose, string][] = [
  ["idea", "app.home.quipJob"],
  ["proud", "app.home.quipBreakfast"],
  ["surprised", "app.home.quipNumbers"],
  ["love", "app.home.quipClick"],
];

export default function HomeHero() {
  const pathy = usePathy();
  const { t } = useT();
  return (
    <>
      <section className={styles.hero}>
        <h1>
          {t("app.home.heading")
            .split(" ")
            .map((word, index) => (
              <span
                key={`${word}-${index}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {word}
              </span>
            ))}
        </h1>
        <button
          className={styles.heroPathy}
          aria-label={t("app.home.hello")}
          onClick={() => {
            const [pose, key] = quips[Math.floor(Math.random() * quips.length)];
            pathy.react(pose, t(key));
          }}
        >
          <Image
            src={pathyPoseSrc("hello")}
            alt=""
            width={170}
            height={170}
            unoptimized
          />
        </button>
      </section>
      <p className={styles.note}>{t("app.home.note")}</p>
    </>
  );
}
