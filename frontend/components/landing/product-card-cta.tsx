import Link from "next/link";

export default function ProductCardCTA() {
  return (
    <Link
      href="/workspace-v2/new"
      className="text-sm text-primary hover:underline transition-colors"
    >
      Analyze My CV →
    </Link>
  );
}
