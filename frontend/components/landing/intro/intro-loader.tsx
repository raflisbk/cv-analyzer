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
      <div className={styles.glow} data-intro-glow />
      <div className={styles.logo}>
        <svg className={styles.icon} data-intro-icon viewBox="0 0 100 100">
          <g data-intro-wiggle>
            <rect width="100" height="100" rx="26" fill="#f42902" />
            <path
              data-intro-path
              pathLength="100"
              d="M24 76C24 58 50 66 50 50S76 44 76 28"
              fill="none"
              stroke="#fdfdff"
              strokeWidth="9.5"
              strokeLinecap="round"
            />
            <circle data-intro-start cx="24" cy="76" r="6.5" fill="#fdfdff" />
            <circle
              data-intro-ring
              cx="76"
              cy="27"
              r="10.5"
              fill="none"
              stroke="#fdfdff"
              strokeWidth="3"
            />
            <circle data-intro-end cx="76" cy="27" r="10.5" fill="#f2ff00" />
          </g>
        </svg>
        <div className={styles.wordmarkClip} data-intro-clip>
          <Image
            className={styles.wordmark}
            data-intro-wordmark
            src="/landing/logo/pathkr-wordmark-red.svg"
            alt=""
            width={366}
            height={112}
            priority
          />
          <span className={styles.expanded} data-intro-expanded>
            path k<b>a</b>r<b>i</b>
            <b>r</b>
          </span>
        </div>
      </div>
    </div>
  );
}
