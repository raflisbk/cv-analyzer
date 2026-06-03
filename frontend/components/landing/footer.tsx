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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="font-display text-xl font-extrabold tracking-tight text-[#F5F2D8]">
                path<span className="text-[#CAFF43]">kr</span>
              </span>
            </Link>
            <p className="text-[15px] leading-relaxed mb-6" style={{ color: "rgba(245,242,216,0.60)" }}>
              AI-powered career tools designed to elevate your professional journey,
              from scoring your CV to securing your dream job.
            </p>
            <div className="flex items-center gap-2">
              <AccentPill color="lime" size="sm">Free for individuals</AccentPill>
            </div>
          </div>

          <div>
            <h4
              className="font-display font-bold text-sm tracking-wider uppercase mb-6"
              style={{ color: "rgba(245,242,216,0.40)" }}
            >
              Products
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/cv-analyzer"
                  className="text-sm font-medium transition-colors hover:text-[#CAFF43]"
                  style={{ color: "rgba(245,242,216,0.60)" }}
                >
                  CV Analyzer
                </Link>
              </li>
              <li>
                <span
                  className="text-sm font-medium cursor-not-allowed transition-colors flex items-center gap-2"
                  style={{ color: "rgba(245,242,216,0.40)" }}
                >
                  CV Builder
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(245,242,216,0.40)",
                    }}
                  >
                    Soon
                  </span>
                </span>
              </li>
              <li>
                <span
                  className="text-sm font-medium cursor-not-allowed transition-colors flex items-center gap-2"
                  style={{ color: "rgba(245,242,216,0.40)" }}
                >
                  Job Match
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(245,242,216,0.40)",
                    }}
                  >
                    Soon
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="font-display font-bold text-sm tracking-wider uppercase mb-6"
              style={{ color: "rgba(245,242,216,0.40)" }}
            >
              Resources
            </h4>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Contact Us"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm font-medium transition-colors hover:text-[#F5F2D8]"
                    style={{ color: "rgba(245,242,216,0.60)" }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="text-xs font-medium" style={{ color: "rgba(245,242,216,0.40)" }}>
            © {new Date().getFullYear()} Pathkr Inc. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-3">
            {/* Twitter / X */}
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "rgba(245,242,216,0.40)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "#F5F2D8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "rgba(245,242,216,0.40)";
              }}
              aria-label="Twitter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
            {/* GitHub */}
            <a
              href="#"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "rgba(245,242,216,0.40)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "#F5F2D8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "rgba(245,242,216,0.40)";
              }}
              aria-label="GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
