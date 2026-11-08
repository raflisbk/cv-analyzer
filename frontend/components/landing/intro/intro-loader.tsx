"use client";

import Image from "next/image";
import { useLandingIntro } from "@/hooks/use-landing-intro";
import styles from "./intro.module.css";

export default function IntroLoader() {
  const loaderRef = useLandingIntro();

  return (
    <div
      ref={loaderRef}
      className={styles.loader}
      aria-hidden="true"
      data-landing-loader
    >
      <div className={styles.brand}>
        <svg
          className={styles.mark}
          viewBox="0 0 100 100"
          role="img"
          aria-label="pathkr"
        >
          <rect width="100" height="100" rx="26" fill="#f42902" />
          <path
            data-intro-path
            d="M24 76C24 58 50 66 50 50S76 44 76 28"
            fill="none"
            stroke="#fdfdff"
            strokeWidth="9.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="76" r="6.5" fill="#fdfdff" />
          <circle data-intro-dot cx="76" cy="27" r="10.5" fill="#f2ff00" />
        </svg>
        <Image
          data-intro-wordmark
          src="/landing/logo/pathkr-wordmark-snow.svg"
          alt=""
          width={360}
          height={96}
          priority
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.count}>
          <span data-intro-count>0</span>
          <small>%</small>
        </span>
        <span className={styles.tag}>warming up your CV...</span>
      </div>
      <div className={styles.bar}>
        <i data-intro-bar />
      </div>
      <div className={styles.lip} />
    </div>
  );
}
