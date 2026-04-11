import { cn } from "@/lib/utils";

interface AccentPillProps {
  color: "lime" | "pink" | "orange" | "purple" | "white" | "dark";
  size?: "sm" | "md" | "hero";
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<AccentPillProps["color"], string> = {
  lime:   "bg-[#CAFF43] text-[#141414]",
  pink:   "bg-[#FF4FCB] text-[#141414]",
  orange: "bg-[#FF8C42] text-[#141414]",
  purple: "bg-[#8B5CF6] text-[#F5F2D8]",
  white:  "bg-white text-[#141414]",
  dark:   "bg-[#141414] text-[#F5F2D8]",
};

const sizeMap: Record<NonNullable<AccentPillProps["size"]>, string> = {
  sm:   "rounded-full px-4 py-1 text-sm font-extrabold tracking-wide",
  md:   "rounded-full px-6 py-2 text-base font-extrabold tracking-wide",
  hero: "rounded-2xl px-[0.4em] py-[0.08em] text-[0.82em] font-extrabold tracking-wider",
};

export function AccentPill({ color, size = "sm", children, className }: AccentPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-display leading-none",
        colorMap[color],
        sizeMap[size],
        className
      )}
    >
      {children}
    </span>
  );
}
