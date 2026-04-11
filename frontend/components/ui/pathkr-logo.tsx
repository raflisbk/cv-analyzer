/**
 * PathKarirLogo — brand mark for "Path Karir" (short: pathkr, domain: pathkr.ai).
 *
 * Design: split-color typography — no pills, just letter-level color accents.
 * - "Path Ka"  → base color (cream on dark bg, dark on light bg)
 * - "K"        → lime #CAFF43 on dark / purple #8B5CF6 on light  (kr monogram start)
 * - "ari"      → base color at 50% opacity (muted bridge)
 * - "r"        → same accent as K  (kr monogram end)
 *
 * Both "K" and "r" share one accent color so "kr" reads as a visual unit.
 */

interface PathkrLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PathkrLogoProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-5xl",
};

export function PathkrLogo({
  size = "md",
  variant = "light",
  className = "",
}: PathkrLogoProps) {
  const base  = variant === "dark" ? "text-[#F5F2D8]"       : "text-[#141414]";
  const muted = variant === "dark" ? "text-[#F5F2D8]/50"    : "text-[#141414]/50";
  const kr    = variant === "dark" ? "text-[#CAFF43]"        : "text-[#8B5CF6]";

  return (
    <span
      className={`font-display font-extrabold tracking-tight
                  ${SIZE_CLASSES[size]} ${base} ${className}`}
    >
      {"Path "}
      <span className={kr}>K</span>
      <span className={muted}>ari</span>
      <span className={kr}>r</span>
    </span>
  );
}

/**
 * PathkrInline — use inside existing text nodes / headings.
 * Inherits surrounding font size; renders "Path Karir" inline.
 */
export function PathkrInline({ variant = "light" }: { variant?: "light" | "dark" }) {
  const base  = variant === "dark" ? "text-[#F5F2D8]"       : "text-[#141414]";
  const muted = variant === "dark" ? "text-[#F5F2D8]/50"    : "text-[#141414]/50";
  const kr    = variant === "dark" ? "text-[#CAFF43]"        : "text-[#8B5CF6]";

  return (
    <span className={`font-display font-extrabold tracking-tight ${base}`}>
      {"Path "}
      <span className={kr}>K</span>
      <span className={muted}>ari</span>
      <span className={kr}>r</span>
    </span>
  );
}
