import { easeInOutCubic, pointAt } from "@/lib/landing-nav-scroll";
import type { FlightPath, Point } from "@/lib/landing-nav-scroll";

function createPlane() {
  const plane = document.createElement("img");
  plane.src = "/landing/3d/paper-plane.webp";
  plane.alt = "";
  plane.setAttribute("aria-hidden", "true");
  Object.assign(plane.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "84px",
    zIndex: "9998",
    pointerEvents: "none",
    opacity: "0",
    filter: "drop-shadow(0 10px 8px rgba(60,6,0,.4))",
  });
  return plane;
}

function createTrail() {
  const trail = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  Object.assign(trail.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "9997",
    pointerEvents: "none",
  });
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#fdfdff");
  line.setAttribute("stroke-width", "5");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-dasharray", "2 14");
  line.setAttribute("opacity", ".85");
  trail.appendChild(line);
  return { trail, line };
}

export function createFlight() {
  const plane = createPlane();
  const { trail, line } = createTrail();
  document.body.append(trail, plane);
  return { plane, trail, line };
}

export function paintFlight(
  path: FlightPath,
  progress: number,
  plane: HTMLImageElement,
  line: SVGPathElement,
) {
  const phase = easeInOutCubic(Math.min(1, progress * 1.08));
  const point = pointAt(path, phase);
  const next = pointAt(path, Math.min(1, phase + 0.02));
  const angle =
    (Math.atan2(next.y - point.y, next.x - point.x) * 180) / Math.PI;
  plane.style.opacity = String(Math.min(1, progress / 0.04));
  plane.style.transform = `translate(${point.x - 42}px, ${point.y - 30}px) rotate(${angle + 20}deg)`;
  const end = Math.max(2, Math.round(phase * 40));
  const points: Point[] = [];
  for (let index = Math.max(0, end - 14); index <= end; index++) {
    points.push(pointAt(path, index / 40));
  }
  line.setAttribute(
    "d",
    `M${points.map(({ x, y }) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(" L")}`,
  );
}

export function bounceHeading(section: HTMLElement) {
  section.querySelector("h2")?.animate(
    [
      { transform: "translateY(0) rotate(0)" },
      {
        transform: "translateY(-22px) rotate(-2deg) scale(1.03)",
        offset: 0.3,
      },
      { transform: "translateY(6px) rotate(1.4deg)", offset: 0.55 },
      { transform: "translateY(-5px) rotate(-.6deg)", offset: 0.78 },
      { transform: "translateY(0) rotate(0)" },
    ],
    { duration: 800, easing: "cubic-bezier(.3,1.4,.5,1)" },
  );
}
