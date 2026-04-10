import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
    >
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between"
      >
        <span className="text-base font-semibold text-foreground tracking-tight">
          CV Analyzer
        </span>
        <Button asChild size="default" variant="default">
          <Link href="/#upload">Analyze My CV</Link>
        </Button>
      </nav>
    </header>
  );
}
