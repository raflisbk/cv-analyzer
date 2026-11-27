import { lidDegrees } from "@/lib/landing-laptop";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function paintLaptopLid(stage: HTMLElement, lid: number) {
  stage.style.setProperty("--laptop-lid", `${lidDegrees(lid)}deg`);
  const sweep = clamp((lid - 0.55) / 0.45);
  stage.style.setProperty("--laptop-sweep", `${-100 + 200 * sweep}%`);
  stage.style.setProperty(
    "--laptop-sweep-alpha",
    String(sweep > 0 && sweep < 1 ? Math.sin(Math.PI * sweep) : 0),
  );
}
