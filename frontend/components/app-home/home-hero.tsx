"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useT } from "@/components/i18n/i18n-provider";
import { pathyPoseSrc, type PathyPose } from "@/lib/pathy/pose";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./home.module.css";

const QUIPS: [PathyPose, string][] = [
  ["idea", "app.home.quipJob"],
  ["proud", "app.home.quipBreakfast"],
  ["surprised", "app.home.quipNumbers"],
  ["love", "app.home.quipClick"],
];
const QUIP_MS = 2800;

function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? "";
}

export default function HomeHero() {
  const { t } = useT();
  const name = firstName(useAuthStore((state) => state.user?.name));
  const [quip, setQuip] = useState<[PathyPose, string] | null>(null);
  useEffect(() => {
    if (!quip) {
      return;
    }
    const timer = setTimeout(() => setQuip(null), QUIP_MS);
    return () => clearTimeout(timer);
  }, [quip]);
  const pose = quip?.[0] ?? "hello";
  return (
    <section className={styles.hero}>
      <button
        className={styles.pathy}
        type="button"
        aria-label={t("app.home.hello")}
        onClick={() => setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)])}
      >
        <Image
          src={pathyPoseSrc(pose)}
          alt=""
          width={72}
          height={72}
          unoptimized
        />
      </button>
      <p className={styles.hand} aria-live="polite">
        {quip ? t(quip[1]) : t("app.home.note")}
      </p>
      <h1>
        {name
          ? t("app.chat.greetingNamed", { name })
          : t("app.chat.greetingAnon")}{" "}
        <span className={styles.mark}>{t("app.chat.greetingMark")}</span>?
      </h1>
    </section>
  );
}
