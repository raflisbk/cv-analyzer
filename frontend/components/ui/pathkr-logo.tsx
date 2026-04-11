/**
 * PathkrLogo — shared brand mark for "pathkr".
 * The "k" uses a solid purple pill (#8B5CF6) for readability on any background.
 * Variants: "light" (on cream/light bg) | "dark" (on dark bg)
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

const VARIANT_TEXT: Record<NonNullable<PathkrLogoProps["variant"]>, string> = {
  light: "text-[#141414]",
  dark: "text-[#F5F2D8]",
};

export function PathkrLogo({ size = "md", variant = "light", className = "" }: PathkrLogoProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight inline-flex items-baseline gap-0 ${SIZE_CLASSES[size]} ${VARIANT_TEXT[variant]} ${className}`}
    >
      path
      {/* "k" as a distinct purple pill — high contrast on both cream and dark */}
      <span className="inline-flex items-center justify-center bg-[#8B5CF6] text-white rounded-[5px] px-[0.2em] mx-[0.05em] leading-tight">
        k
      </span>
      r
    </span>
  );
}

/**
 * PathkrInline — use inside existing <p> or <h2> text nodes.
 * Renders the brand mark inline without a block wrapper.
 */
export function PathkrInline({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <span className={`font-display font-extrabold tracking-tight inline-flex items-baseline gap-0 ${VARIANT_TEXT[variant]}`}>
      path
      <span className="inline-flex items-center justify-center bg-[#8B5CF6] text-white rounded-[5px] px-[0.2em] mx-[0.05em] leading-tight text-[0.85em]">
        k
      </span>
      r
    </span>
  );
}
