import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ProductCardCTA() {
  return (
    <Link
      href="/workspace-v2/new"
      className="text-sm text-primary hover:underline transition-colors"
    >
      <span className="inline-flex items-center gap-1.5">
        Analyze My CV
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
