"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-foreground"
        >
          path<span className="text-primary">k</span>r
        </Link>

        {/* Desktop product links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/cv-builder"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            CV Builder
          </Link>
          <button
            onClick={openModal}
            className="text-sm text-foreground hover:text-foreground/80 transition-colors duration-150"
          >
            CV Analyzer
          </button>
          <Link
            href="/job-finding"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Job Finding
          </Link>
        </div>

        {/* Desktop CTA — hidden on mobile */}
        <div className="hidden md:block">
          <Button onClick={openModal}>Get Started</Button>
        </div>

        {/* Mobile hamburger + Sheet drawer — hidden on desktop */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col pt-12 gap-1">
            {/* Mobile product links */}
            <SheetClose asChild>
              <Link
                href="/cv-builder"
                className="text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md"
              >
                CV Builder
              </Link>
            </SheetClose>
            <button
              onClick={() => {
                openModal();
                setMobileOpen(false);
              }}
              className="text-base text-foreground text-left py-3 px-2 rounded-md hover:bg-muted transition-colors"
            >
              CV Analyzer
            </button>
            <SheetClose asChild>
              <Link
                href="/job-finding"
                className="text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md"
              >
                Job Finding
              </Link>
            </SheetClose>

            {/* Mobile CTA at bottom */}
            <div className="mt-auto pt-6 border-t border-border">
              <Button
                className="w-full"
                onClick={() => {
                  openModal();
                  setMobileOpen(false);
                }}
              >
                Get Started
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
