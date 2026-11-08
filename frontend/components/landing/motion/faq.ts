import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function faqMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(
    panel.querySelector("h2"),
    { yPercent: 130, autoAlpha: 0, duration: 0.45 },
    0,
  )
    .from(
      panel.querySelectorAll("[data-faq-object]"),
      {
        y: -300,
        rotate: 60,
        autoAlpha: 0,
        stagger: 0.3,
        duration: 0.8,
        ease: "elastic.out(1,.45)",
      },
      0.35,
    )
    .from(
      panel.querySelectorAll("[data-faq-item]"),
      {
        x: (i: number) => (i % 2 ? 160 : -160),
        autoAlpha: 0,
        stagger: 0.14,
        duration: 0.4,
      },
      0.2,
    );
  const count = panel.querySelectorAll("[data-faq-item]").length;
  tl.eventCallback("onUpdate", () => {
    const index = Math.floor(tl.progress() * (count + 1)) - 1;
    panel.dispatchEvent(new CustomEvent("landing-faq-step", { detail: index }));
  });
}
