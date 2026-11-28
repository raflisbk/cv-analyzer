"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { POSTER_SIZE } from "@/lib/landing-laptop-poster";
import { paintLaptop } from "@/components/landing/motion/laptop";
import { useT } from "@/components/i18n/i18n-provider";
import { mountLaptopController, type LaptopStatus } from "./controller";
import styles from "../laptop.module.css";

function reducedMotion() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function LaptopCanvas() {
  const { t } = useT();
  const label = t("landing.inside.opening");
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LaptopStatus | "pending">("pending");

  useEffect(() => {
    const host = hostRef.current;
    const panel = host?.closest<HTMLElement>("section");
    if (!host || !panel) {
      return;
    }
    if (reducedMotion()) {
      setStatus("failed");
      return;
    }
    return mountLaptopController(host, panel, label, setStatus);
  }, [label]);

  useEffect(() => {
    const panel = hostRef.current?.closest<HTMLElement>("section");
    if (panel && status === "failed") {
      paintLaptop(
        panel,
        Number(panel.dataset.laptopProgress || 0),
        reducedMotion(),
      );
    }
  }, [status]);

  return (
    <div
      className={styles.canvasHost}
      ref={hostRef}
      role={status === "failed" ? "img" : undefined}
      aria-label={status === "failed" ? label : undefined}
      data-laptop-canvas
    >
      {status === "failed" && (
        <Image
          className={styles.poster}
          src="/landing/laptop/poster.webp"
          alt=""
          width={POSTER_SIZE.width}
          height={POSTER_SIZE.height}
          draggable={false}
          unoptimized
          data-laptop-poster
        />
      )}
    </div>
  );
}
