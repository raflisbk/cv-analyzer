

"use client";

import { useEffect, useState } from "react";
import { Arc } from "@visx/shape";
import { Group } from "@visx/group";

interface GaugeChartProps {
  value: number;
  label: string;
  size?: number;
  accentColor?: string;
}

function getArcColor(value: number, accentColor?: string): string {
  if (accentColor) { return accentColor; }
  if (value >= 70) return "#CAFF43";
  if (value >= 40) return "#FF8C42";
  return "#FF4FCB";
}

export function GaugeChart({ value, label, size = 160, accentColor }: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  const cx = size / 2;
  const cy = size / 2 + size * 0.05;
  const r = (size / 2) * 0.68;
  const strokeWidth = size * 0.088;
  const startAngle = -Math.PI * 0.8;
  const endAngle   =  Math.PI * 0.8;

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setAnimatedValue(value); return; }
    const start = performance.now();
    const duration = 900;
    const raf = (ts: number) => {
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedValue(Math.round(eased * value));
      if (t < 1) { requestAnimationFrame(raf); }
    };
    requestAnimationFrame(raf);
  }, [value]);

  const arcColor   = getArcColor(value, accentColor);
  const valueAngle = startAngle + (animatedValue / 100) * (endAngle - startAngle);

  return (
    <svg width={size} height={size} aria-label={`${label} score: ${value} out of 100`}>
      <Group top={cy} left={cx}>
        <Arc
          innerRadius={r - strokeWidth}
          outerRadius={r}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="rgba(245,242,216,0.12)"
        />
        <Arc
          innerRadius={r - strokeWidth}
          outerRadius={r}
          startAngle={startAngle}
          endAngle={valueAngle}
          fill={arcColor}
        />
        {animatedValue > 1 && (() => {
          const tipAngle = valueAngle - Math.PI / 2;
          const tipR = r - strokeWidth / 2;
          return (
            <circle
              cx={Math.cos(tipAngle) * tipR}
              cy={Math.sin(tipAngle) * tipR}
              r={strokeWidth / 2 + 1}
              fill={arcColor}
              opacity={0.7}
            />
          );
        })()}
        <text
          textAnchor="middle"
          dy="-0.1em"
          fontSize={size * 0.22}
          fontWeight={800}
          fontFamily="'Bricolage Grotesque', sans-serif"
          fill={arcColor}
          letterSpacing="-1"
        >
          {animatedValue}
        </text>
        <text
          textAnchor="middle"
          dy={size * 0.14}
          fontSize={size * 0.08}
          fontWeight={600}
          fontFamily="'Bricolage Grotesque', sans-serif"
          fill="rgba(245,242,216,0.35)"
        >
          /100
        </text>
      </Group>
    </svg>
  );
}
