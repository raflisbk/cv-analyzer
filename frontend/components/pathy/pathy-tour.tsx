"use client";

import { useEffect, useRef, useState } from "react";
import { TOURS } from "@/lib/pathy/tours";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { usePathyTourTarget } from "@/hooks/use-pathy-tour-target";
import PathyTourCard from "./pathy-tour-card";
import styles from "./pathy.module.css";

export default function PathyTour({
  name,
  close,
}: {
  name: string | null;
  close: () => void;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const steps = name ? TOURS[name] : undefined;
  const step = steps?.[index];
  const { rect, missing } = usePathyTourTarget(step);
  useAppShellFocusTrap(Boolean(step), ref, close);
  useEffect(() => {
    setIndex(0);
  }, [name]);
  if (!step || !steps) {
    return null;
  }
  return (
    <div
      className={styles.tourOverlay}
      role="presentation"
      style={{
        background: rect
          ? `radial-gradient(ellipse ${Math.max(rect.width, rect.height) * 0.9}px ${Math.max(rect.height, 60)}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 55%, rgba(80,8,0,.72) 60%)`
          : undefined,
      }}
    >
      {rect && (
        <div
          className={styles.spotlight}
          style={{
            left: rect.left - 8,
            top: rect.top - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      )}
      <PathyTourCard
        step={step}
        index={index}
        total={steps.length}
        missing={missing}
        back={() => setIndex(Math.max(0, index - 1))}
        next={() =>
          index + 1 === steps.length ? close() : setIndex(index + 1)
        }
        close={close}
        innerRef={ref}
      />
    </div>
  );
}
