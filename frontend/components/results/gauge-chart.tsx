/**
 * Single Visx radial gauge chart per D-22, SCORE-06.
 * Uses Arc from @visx/shape (NOT @visx/arc which does not exist).
 */

"use client";

import { useEffect, useState } from "react";
import { Arc } from "@visx/shape";
import { Group } from "@visx/group";

interface GaugeChartProps {
  value: number; // 0-100
  label: string;
  size?: number; // SVG width/height, default 160 per UI-SPEC §7 C2
}

// Score range arc colors per UI-SPEC §4
const ARC_COLORS = {
  good: "#16a34a", // green-600 (80-100)
  average: "#d97706", // amber-600 (60-79)
  poor: "#dc2626", // red-600   (0-59)
  track: "#e2e8f0", // slate-200 (unfilled track)
} as const;

function getArcColor(value: number): string {
  if (value >= 80) { return ARC_COLORS.good; }
  if (value >= 60) { return ARC_COLORS.average; }
  return ARC_COLORS.poor;
}

export function GaugeChart({ value, label, size = 160 }: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.7;
  const strokeWidth = 14;
  const startAngle = -Math.PI * 0.75;
  const endAngle = Math.PI * 0.75;

  // Animate arc on mount per UI-SPEC §8 (gauge chart animation)
  useEffect(() => {
    // Respect prefers-reduced-motion per UI-SPEC §9
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setAnimatedValue(value);
      return;
    }    const start = performance.now();
    const duration = 800;
    const raf = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedValue(Math.round(eased * value));
      if (progress < 1) { requestAnimationFrame(raf); }
    };
    requestAnimationFrame(raf);
  }, [value]);

  const valueAngle =
    startAngle + (animatedValue / 100) * (endAngle - startAngle);
  const arcColor = getArcColor(value);

  return (
    <svg
      width={size}
      height={size}
      aria-label={`${label} score: ${value} out of 100`}
    >
      <Group top={cy} left={cx}>
        {/* Track arc — full unfilled background */}
        <Arc
          innerRadius={r - strokeWidth}
          outerRadius={r}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={ARC_COLORS.track}
        />
        {/* Value arc — animated fill */}
        <Arc
          innerRadius={r - strokeWidth}
          outerRadius={r}
          startAngle={startAngle}
          endAngle={valueAngle}
          fill={arcColor}
        />
        {/* Score number in center per UI-SPEC §7 C2 */}
        <text
          textAnchor="middle"
          dy="0.35em"
          fontSize={28}
          fontWeight={600}
          fill={arcColor}
        >
          {animatedValue}
        </text>
      </Group>
    </svg>
  );
}
