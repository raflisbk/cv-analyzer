import Link from "next/link";
import { AccentPill } from "@/components/ui/accent-pill";

export default function Footer() {
  return (
    <footer
      className="relative pt-20 pb-10"
      style={{
        background: "#141414",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top glow line — mirrors navbar bottom glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(202,255,67,0.35) 30%, rgba(202,255,67,0.50) 50%, rgba(202,255,67,0.35) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display text-xl font-extrabold tracking-tight text-[#F5F2D8]">
                path<span className="text-[#CAFF43]">kr</span>
              </span>
            </Link>
            <p className="text-[15px] leading-relaxed mb-6 text-[#F5F2D8]/60">
              AI-powered career tools designed to elevate your professional
              journey, from scoring your CV to securing your dream job.
            </p>
            <div className="flex items-center gap-2">
              <AccentPill color="lime" size="sm">
                Free for individuals
              </AccentPill>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm tracking-wider uppercase mb-6 text-[#F5F2D8]/40">
              Products
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/cv-analyzer"
                  className="text-sm font-medium text-[#F5F2D8]/60 transition-colors hover:text-[#CAFF43]"
                >
                  CV Analyzer
                </Link>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm font-medium text-[#F5F2D8]/40 cursor-not-allowed">
                  CV Builder
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.07] text-[#F5F2D8]/40">
                    Soon
                  </span>
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm font-medium text-[#F5F2D8]/40 cursor-not-allowed">
                  Job Match
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.07] text-[#F5F2D8]/40">
                    Soon
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.07]">
          <p className="text-xs font-medium text-[#F5F2D8]/40">
            © {new Date().getFullYear()} Mohamad Rafli Agung Subekti. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
