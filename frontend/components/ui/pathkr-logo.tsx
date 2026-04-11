/**
 * PathkrLogo — brand mark for "Path Karir".
 * The "K" in "Karir" uses a solid purple pill for distinction and readability.
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

/** Purple "K" pill — shared between logo variants */
function KPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-[#8B5CF6] text-white
                  rounded-[8px] px-[0.22em] py-[0.06em] mx-[0.08em]
                  ring-1 ring-[#7C3AED]/40 shadow-[0_1px_3px_rgba(139,92,246,0.4)]
                  leading-none ${className}`}
    >
      K
    </span>
  );
}

export function PathkrLogo({ size = "md", variant = "light", className = "" }: PathkrLogoProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight inline-flex items-center gap-0
                  ${SIZE_CLASSES[size]} ${VARIANT_TEXT[variant]} ${className}`}
    >
      Path{" "}
      <KPill />
      arir
    </span>
  );
}

/**
 * PathkrInline — use inside existing <p> or <h2> text nodes.
 * Renders "Path Karir" inline without a block wrapper.
 */
export function PathkrInline({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight inline-flex items-center gap-0
                  ${VARIANT_TEXT[variant]}`}
    >
      Path{" "}
      <KPill className="text-[0.82em]" />
      arir
    </span>
  );
}
