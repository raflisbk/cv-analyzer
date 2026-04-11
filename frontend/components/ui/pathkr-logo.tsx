/**
 * PathKarirLogo — brand mark for "Path Karir" (short: pathkr, domain: pathkr.ai).
 * The "K" (start of Karir) and "r" (end of kariR) are highlighted as the "kr" monogram.
 * K = lime pill (#CAFF43)  — primary brand action color
 * r = purple pill (#8B5CF6) — brand identity / .ai color
 * "ari" between them is deliberately muted to let "kr" read as a unit.
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
  dark:  "text-[#F5F2D8]",
};

/** Shared pill base styles */
const PILL_BASE =
  "inline-flex items-center justify-center rounded-[8px] px-[0.22em] py-[0.08em] leading-none font-extrabold";

/** K pill — lime */
function KPill({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`${PILL_BASE} bg-[#CAFF43] text-[#141414]
                  ring-1 ring-[#b8e83a]/60 shadow-[0_1px_4px_rgba(202,255,67,0.35)]
                  ${small ? "text-[0.82em]" : ""}`}
    >
      K
    </span>
  );
}

/** r pill — purple */
function RPill({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`${PILL_BASE} bg-[#8B5CF6] text-white
                  ring-1 ring-[#7C3AED]/50 shadow-[0_1px_4px_rgba(139,92,246,0.4)]
                  ${small ? "text-[0.82em]" : ""}`}
    >
      r
    </span>
  );
}

/** "ari" — the muted bridge between K and r */
function AriText({ variant }: { variant: "light" | "dark" }) {
  const muted = variant === "light" ? "text-[#141414]/35" : "text-[#F5F2D8]/35";
  return (
    <span className={`text-[0.72em] tracking-tight mx-[0.02em] ${muted}`}>
      ari
    </span>
  );
}

export function PathkrLogo({
  size = "md",
  variant = "light",
  className = "",
}: PathkrLogoProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-tight inline-flex items-center gap-[0.12em]
                  ${SIZE_CLASSES[size]} ${VARIANT_TEXT[variant]} ${className}`}
    >
      Path
      <span className="inline-flex items-center gap-0 ml-[0.15em]">
        <KPill />
        <AriText variant={variant} />
        <RPill />
      </span>
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
      className={`font-display font-extrabold tracking-tight inline-flex items-center gap-[0.08em]
                  ${VARIANT_TEXT[variant]}`}
    >
      Path
      <span className="inline-flex items-center gap-0 ml-[0.12em]">
        <KPill small />
        <AriText variant={variant} />
        <RPill small />
      </span>
    </span>
  );
}
