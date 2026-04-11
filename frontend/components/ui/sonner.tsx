"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Mathical-themed Sonner toaster.
 * Dark card (#1C1C1C), accent border per variant, Bricolage Grotesque font.
 */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: [
            "!bg-[#1C1C1C] !border !border-white/10 !rounded-2xl !shadow-2xl",
            "!text-[#F5F2D8] !font-sans",
            "!px-4 !py-3.5",
          ].join(" "),
          title: "!font-display !font-extrabold !text-sm !text-[#F5F2D8]",
          description: "!text-xs !text-[#F5F2D8]/60 !mt-0.5",
          closeButton: [
            "!bg-white/8 !border !border-white/10 !text-[#F5F2D8]/50",
            "hover:!bg-white/15 hover:!text-[#F5F2D8]",
            "!rounded-full",
          ].join(" "),
          success: "!border-[#CAFF43]/25 [&_[data-icon]]:!text-[#CAFF43]",
          error: "!border-[#FF4FCB]/25 [&_[data-icon]]:!text-[#FF4FCB]",
          warning: "!border-[#FF8C42]/25 [&_[data-icon]]:!text-[#FF8C42]",
          info: "!border-[#8B5CF6]/25 [&_[data-icon]]:!text-[#8B5CF6]",
          actionButton: [
            "!bg-[#CAFF43] !text-[#141414] !font-extrabold !text-xs",
            "!rounded-full !px-3 !py-1",
            "hover:!bg-[#CAFF43]/85",
          ].join(" "),
          cancelButton: [
            "!bg-white/8 !text-[#F5F2D8]/60 !text-xs",
            "!rounded-full !px-3 !py-1",
            "hover:!bg-white/15",
          ].join(" "),
        },
      }}
    />
  );
}
