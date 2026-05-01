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
  const base = variant === "dark" ? "text-[#F5F2D8]" : "text-[#141414]";
  const kr   = variant === "dark" ? "text-[#CAFF43]" : "text-[#8B5CF6]";

  return (
    <span
      className={`font-display font-extrabold tracking-tight
                  ${SIZE_CLASSES[size]} ${base} ${className}`}
    >
      {"Path "}
      <span className={kr}>K</span>
      {"ari"}
      <span className={kr}>r</span>
    </span>
  );
}

export function PathkrInline({ variant = "light" }: { variant?: "light" | "dark" }) {
  const base = variant === "dark" ? "text-[#F5F2D8]" : "text-[#141414]";
  const kr   = variant === "dark" ? "text-[#CAFF43]" : "text-[#8B5CF6]";

  return (
    <span className={`font-display font-extrabold tracking-tight ${base}`}>
      {"Path "}
      <span className={kr}>K</span>
      {"ari"}
      <span className={kr}>r</span>
    </span>
  );
}
