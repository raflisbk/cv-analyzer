import type { loadGsap } from "@/lib/gsap-loader";
type Gsap = Awaited<ReturnType<typeof loadGsap>>["gsap"];
export function faqMotion(
  _gsap: Gsap,
  panel: HTMLElement,
  tl: ReturnType<Gsap["timeline"]>,
) {
  tl.from(panel.querySelector("h2"), { autoAlpha: 0, duration: 0.3 }, 0).from(
    panel.querySelectorAll("[data-faq-item]"),
    {
      autoAlpha: 0,
      stagger: 0.08,
      duration: 0.3,
    },
    0.2,
  );
  const count = panel.querySelectorAll("[data-faq-item]").length;
  tl.eventCallback("onUpdate", () => {
    const index = Math.floor(tl.progress() * (count + 1)) - 1;
    panel.dispatchEvent(new CustomEvent("landing-faq-step", { detail: index }));
  });
}
