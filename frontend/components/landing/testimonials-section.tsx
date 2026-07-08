"use client";

import { useEffect, useRef } from "react";
import { loadGsap, type GsapCtx } from "@/lib/gsap-loader";

const testimonials = [
  {
    quote:
      "The AI scoring gave me specific, actionable feedback I couldn't get from generic CV templates. Landed 3 interviews in 2 weeks.",
    name: "Rina S.",
    role: "Marketing Manager",
    initials: "RS",
    color: "#CAFF43",
  },
  {
    quote:
      "I didn't realize my CV was failing ATS checks until I used Path Karir. After fixing the issues, my application response rate doubled.",
    name: "Andi P.",
    role: "Software Engineer",
    initials: "AP",
    color: "#FF4FCB",
  },
  {
    quote:
      "The chat assistant helped me rewrite my summary paragraph in minutes. It felt like having a career coach available 24/7.",
    name: "Maya K.",
    role: "Product Designer",
    initials: "MK",
    color: "#8B5CF6",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<GsapCtx | null>(null);

  useEffect(() => {
    if (!sectionRef.current) {
      return;
    }
    let ctx: GsapCtx | null = null;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".testimonials-heading",
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".testimonials-heading",
              start: "top 85%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          ".testimonial-card",
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".testimonial-card",
              start: "top 85%",
              once: true,
            },
          }
        );
      }, sectionRef);
      ctxRef.current = ctx;
    });
    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="snap-section" style={{ background: "#141414" }}>
      <div className="flex-1 flex items-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
          <div className="testimonials-heading mb-10 text-center">
            <h2 className="mb-4 font-display text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F2D8]">
              Trusted by job seekers
            </h2>
            <p className="text-base font-medium tracking-wide text-[#F5F2D8]/40">
              Real feedback from real users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card group relative overflow-hidden rounded-2xl p-6 gradient-border card-hover"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div
                  className="mb-4 text-3xl leading-none font-display font-extrabold"
                  style={{ color: t.color, opacity: 0.4 }}
                >
                  &ldquo;
                </div>
                <p className="mb-6 text-[14px] leading-relaxed text-[#F5F2D8]/70">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: t.color, color: "#141414" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#F5F2D8]/80">{t.name}</p>
                    <p className="text-[11px] text-[#F5F2D8]/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
