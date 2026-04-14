"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ArrowRight, Sparkles, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useUploadModal } from "@/components/providers/upload-modal-provider";
import { PathkrLogo } from "@/components/ui/pathkr-logo";

const NAV_LINKS = [
  { href: "/cv-builder", label: "CV Builder", badge: null },
  { href: "/cv-analyzer", label: "CV Analyzer", badge: "Free" },
  { href: "/job-finding", label: "Job Finding", badge: null },
] as const;

export default function Navbar() {
  const { openModal } = useUploadModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll shadow when user scrolls
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        // Warm frosted glass — perfectly aligned with workspace header language
        background: "rgba(245,242,216,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        // Warm inset top highlight + bottom border
        borderBottom: "1px solid rgba(17,17,17,0.10)",
        boxShadow: scrolled
          ? "inset 0 1px 0 rgba(255,255,255,0.80), 0 6px 32px rgba(17,17,17,0.09)"
          : "inset 0 1px 0 rgba(255,255,255,0.70), 0 2px 12px rgba(17,17,17,0.04)",
        transition: "box-shadow 250ms ease",
      }}
    >
      {/* Lime accent hairline at bottom — brand signature identical to workspace header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(202,255,67,0.50) 25%, rgba(202,255,67,0.72) 50%, rgba(202,255,67,0.50) 75%, transparent 100%)",
        }}
      />

      <nav
        aria-label="Main navigation"
        className="relative mx-auto flex h-[60px] max-w-6xl items-center justify-between px-4 md:px-8"
      >
        {/* ── Logo ── */}
        <Link href="/" aria-label="Path Karir home" className="group flex-none">
          <div className="transition-transform duration-200 group-hover:scale-[1.04]">
            <PathkrLogo size="md" variant="light" />
          </div>
        </Link>

        {/* ── Desktop centre nav links ── */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-200"
              style={{ color: "rgba(17,17,17,0.55)" }}
            >
              {/* Hover pill bg */}
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(17,17,17,0.06)" }}
                aria-hidden="true"
              />

              <span className="relative">{link.label}</span>

              {/* Free badge */}
              {link.badge && (
                <span
                  className="relative rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide"
                  style={{ background: "#CAFF43", color: "#1a2900" }}
                >
                  {link.badge}
                </span>
              )}

              {/* Active underline dot — lime */}
              <span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-[#CAFF43] opacity-0 group-hover:w-5 group-hover:opacity-100 transition-all duration-200"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>

        {/* ── Desktop CTAs ── */}
        <div className="hidden md:flex items-center gap-2">
          {/* Ghost "Sign in" link */}
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-150"
            style={{
              color: "rgba(17,17,17,0.50)",
              background: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(17,17,17,0.85)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(17,17,17,0.50)")
            }
          >
            Sign in
          </button>

          {/* Divider */}
          <div
            className="h-5 w-px"
            style={{ background: "rgba(17,17,17,0.13)" }}
            aria-hidden="true"
          />

          {/* Primary CTA — warm dark pill */}
          <button
            onClick={openModal}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-[13px] font-black tracking-wide transition-all duration-200 hover:opacity-92 active:scale-[0.97]"
            style={{
              // Warm dark matching hero card (#141414) but not pure cold black
              background: "linear-gradient(135deg, #1E1A12 0%, #141414 60%, #1A170F 100%)",
              color: "#F5F2D8",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* Shimmer on hover */}
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.2s_ease_1]"
              aria-hidden="true"
            />
            <span className="relative">Get Started</span>
            <span
              className="relative flex h-5 w-5 flex-none items-center justify-center rounded-full"
              style={{ background: "#CAFF43" }}
            >
              <ArrowRight
                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: "#141414" }}
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        {/* ── Mobile hamburger ── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150"
              style={{
                color: "rgba(17,17,17,0.65)",
                background: "rgba(17,17,17,0.06)",
                border: "1px solid rgba(17,17,17,0.09)",
              }}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </SheetTrigger>

          {/* Mobile drawer */}
          <SheetContent
            side="right"
            className="flex flex-col gap-0 pt-0 outline-none"
            style={{
              background: "rgba(245,242,216,0.97)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(17,17,17,0.10)",
              boxShadow: "-8px 0 40px rgba(17,17,17,0.12)",
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "rgba(17,17,17,0.08)" }}
            >
              <PathkrLogo size="md" variant="light" />
              <SheetClose asChild>
                <button
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  style={{
                    background: "rgba(17,17,17,0.06)",
                    border: "1px solid rgba(17,17,17,0.09)",
                  }}
                >
                  <X className="h-4 w-4" style={{ color: "rgba(17,17,17,0.55)" }} />
                </button>
              </SheetClose>
            </div>

            {/* Mobile links */}
            <nav className="flex flex-col gap-0.5 px-3 py-4">
              {NAV_LINKS.map((link) => (
                <SheetClose key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-150"
                    style={{ color: "rgba(17,17,17,0.65)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(17,17,17,0.05)";
                      e.currentTarget.style.color = "rgba(17,17,17,0.9)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(17,17,17,0.65)";
                    }}
                  >
                    <span className="text-[15px] font-bold">{link.label}</span>
                    {link.badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                        style={{ background: "#CAFF43", color: "#1a2900" }}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </SheetClose>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div
              className="mt-auto border-t px-4 py-5"
              style={{ borderColor: "rgba(17,17,17,0.08)" }}
            >
              {/* Lime accent hairline above CTA */}
              <div
                className="mb-4 h-px w-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(202,255,67,0.6), transparent)",
                }}
                aria-hidden="true"
              />

              <button
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl px-5 py-4 text-[14px] font-black tracking-wide transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #1E1A12 0%, #141414 60%, #1A170F 100%)",
                  color: "#F5F2D8",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
                onClick={() => {
                  openModal();
                  setMobileOpen(false);
                }}
              >
                <span className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "#CAFF43" }} aria-hidden="true" />
                  Get Started — Free
                </span>
                <span
                  className="relative flex h-8 w-8 flex-none items-center justify-center rounded-xl"
                  style={{ background: "#CAFF43" }}
                >
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: "#141414" }}
                    aria-hidden="true"
                  />
                </span>
              </button>

              <p
                className="mt-3 text-center text-[11px] font-medium"
                style={{ color: "rgba(17,17,17,0.38)" }}
              >
                Free. Instant. No sign-up required.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
