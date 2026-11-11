"use client";

import { forwardRef, useEffect, useState } from "react";
import Image from "next/image";
import { usePathy } from "./pathy-context";
import { pathyPoseSrc, type PathyPose } from "@/lib/pathy/pose";
import PathyMenu from "./pathy-menu";
import styles from "./pathy.module.css";

interface Props {
  pose: PathyPose;
  bubble: string;
}
const quips: [PathyPose, string][] = [
  ["idea", "Try Match it to a job."],
  ["proud", "I read CVs for breakfast."],
  ["detective", "I spot weak verbs from a mile."],
];

const PathyHelper = forwardRef<HTMLButtonElement, Props>(function PathyHelper(
  { pose, bubble },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [idle, setIdle] = useState<PathyPose>("helpdesk");
  const pathy = usePathy();
  useEffect(() => {
    const timer = setInterval(
      () =>
        setIdle(
          ["helpdesk", "think", "guide"][
            Math.floor(Math.random() * 3)
          ] as PathyPose,
        ),
      18000,
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <div className={styles.helper}>
      {bubble && !open && (
        <div className={styles.bubble} role="status">
          {bubble}
        </div>
      )}
      {open && <PathyMenu close={() => setOpen(false)} />}
      <button
        ref={ref}
        className={styles.helperButton}
        type="button"
        aria-label="Pathy help"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (open) {
            const [next, text] =
              quips[Math.floor(Math.random() * quips.length)];
            pathy.react(next, text);
          }
        }}
      >
        <Image
          src={pathyPoseSrc(bubble ? pose : idle)}
          alt=""
          width={112}
          height={112}
          unoptimized
        />
      </button>
    </div>
  );
});
export default PathyHelper;
