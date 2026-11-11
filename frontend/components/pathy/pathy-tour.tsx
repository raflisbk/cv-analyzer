"use client";

import { useEffect, useRef, useState } from "react";
import { TOURS } from "@/lib/pathy/tours";
import { useAppShellFocusTrap } from "@/hooks/use-app-shell-focus-trap";
import { usePathyTourTarget } from "@/hooks/use-pathy-tour-target";
import PathyTourCard from "./pathy-tour-card";
import PathySpotlight from "./pathy-spotlight";
import styles from "./pathy.module.css";

function tourBackground(rect: DOMRect | null): string | undefined {
  return rect
    ? `radial-gradient(ellipse ${Math.max(rect.width, rect.height) * 0.9}px ${Math.max(rect.height, 60)}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 55%, rgba(80,8,0,.72) 60%)`
    : undefined;
}

interface PathyTourProps {
  name: string | null;
  close: () => void;
}

export default function PathyTour({ name, close }: PathyTourProps) {
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
      style={{ background: tourBackground(rect) }}
    >
      <PathySpotlight rect={rect} />
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
