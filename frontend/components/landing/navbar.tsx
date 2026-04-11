"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useUploadModal } from "@/components/providers/upload-modal-provider";

export default function Navbar() {
  const { openModal } = useUploadModal();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#141414]/10 bg-[#F5F2D8]/95 backdrop-blur-sm supports-[backdrop-filter]:bg-[#F5F2D8]/80">
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-display font-extrabold tracking-tight text-[#141414]"
        >
          path<span className="text-[#CAFF43]">k</span>r
        </Link>

        {/* Desktop product links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/cv-builder"
            className="text-sm font-normal text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/8 transition-all duration-150 px-4 py-2 rounded-full"
          >
            CV Builder
          </Link>
          <button
            onClick={openModal}
            className="text-sm font-normal text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/8 transition-all duration-150 px-4 py-2 rounded-full"
          >
            CV Analyzer
          </button>
          <Link
            href="/job-finding"
            className="text-sm font-normal text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/8 transition-all duration-150 px-4 py-2 rounded-full"
          >
            Job Finding
          </Link>
        </div>

        {/* Desktop CTA — two-part pattern, hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={openModal}
            className="rounded-full bg-[#141414] text-[#F5F2D8] text-sm font-extrabold px-5 py-2
                       hover:bg-[#141414]/85 transition-colors duration-150"
          >
            Get Started
          </button>
          <button
            onClick={openModal}
            aria-label="Get started with CV analysis"
            className="w-10 h-10 rounded-full bg-[#CAFF43] flex items-center justify-center
                       hover:bg-[#CAFF43]/85 transition-colors duration-150"
          >
            <ArrowRight className="w-4 h-4 text-[#141414]" />
          </button>
        </div>

        {/* Mobile hamburger + Sheet drawer — hidden on desktop */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-md text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/5 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex flex-col pt-12 gap-1 bg-[#F5F2D8] border-l border-[#141414]/10"
          >
            {/* Mobile product links */}
            <SheetClose asChild>
              <Link
                href="/cv-builder"
                className="text-base font-normal text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/8 transition-all py-3 px-4 rounded-full"
              >
                CV Builder
              </Link>
            </SheetClose>
            <button
              onClick={() => {
                openModal();
                setMobileOpen(false);
              }}
              className="text-base font-normal text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/8 text-left py-3 px-4 rounded-full transition-all"
            >
              CV Analyzer
            </button>
            <SheetClose asChild>
              <Link
                href="/job-finding"
                className="text-base font-normal text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/8 transition-all py-3 px-4 rounded-full"
              >
                Job Finding
              </Link>
            </SheetClose>

            {/* Mobile CTA at bottom — two-part full-width */}
            <div className="mt-auto pt-6 border-t border-[#141414]/10">
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 rounded-full bg-[#141414] text-[#F5F2D8] text-sm font-extrabold
                             py-3 px-5 hover:bg-[#141414]/85 transition-colors duration-150"
                  onClick={() => {
                    openModal();
                    setMobileOpen(false);
                  }}
                >
                  Get Started
                </button>
                <button
                  aria-label="Get started with CV analysis"
                  className="w-12 h-12 rounded-full bg-[#CAFF43] flex items-center justify-center
                             flex-shrink-0 hover:bg-[#CAFF43]/85 transition-colors duration-150"
                  onClick={() => {
                    openModal();
                    setMobileOpen(false);
                  }}
                >
                  <ArrowRight className="w-4 h-4 text-[#141414]" />
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
