export function visibleOnce(element: HTMLElement, enter: () => void) {
  let observer: IntersectionObserver | undefined;
  const watch = () => {
    if (!("IntersectionObserver" in window)) {
      enter();
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer?.disconnect();
          enter();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
  };
  const loader = document.querySelector<HTMLElement>("[data-landing-loader]");
  if (!loader || loader.style.display === "none") {
    watch();
  } else {
    window.addEventListener("landing-intro-complete", watch, { once: true });
  }
  return () => {
    observer?.disconnect();
    window.removeEventListener("landing-intro-complete", watch);
  };
}
