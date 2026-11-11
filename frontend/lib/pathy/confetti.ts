export function burstConfetti(anchor: HTMLElement | null): void {
  if (
    !anchor ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const rect = anchor.getBoundingClientRect();
  const colors = ["#f2ff00", "#fdfdff", "#1a0b07", "#f42902", "#ffd9cf"];
  for (let i = 0; i < 20; i++) {
    const piece = document.createElement("i");
    piece.style.cssText = `position:fixed;z-index:120;pointer-events:none;width:8px;height:12px;border-radius:2px;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;background:${colors[i % colors.length]}`;
    document.body.append(piece);
    const angle = Math.random() * Math.PI * 2;
    piece
      .animate(
        [
          { transform: "translate(0,0) rotate(0)", opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * 150}px,${Math.sin(angle) * 150 - 60}px) rotate(420deg)`,
            opacity: 0,
          },
        ],
        { duration: 1100, easing: "ease-out" },
      )
      .finished.finally(() => piece.remove());
  }
}
