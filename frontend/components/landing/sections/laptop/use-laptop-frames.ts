import { useEffect, useRef } from "react";
import quadsData from "@/public/landing/laptop/screen-quads.json";

function loadFrames(
  canvas: HTMLCanvasElement,
  draw: (index: number) => void,
  isActive: () => boolean,
  current: () => number,
) {
  const pending: Promise<void>[] = [];
  const frames = Array.from({ length: quadsData.frameCount }, (_, index) => {
    const image = new Image();
    image.src = `/landing/laptop/frame-${String(index).padStart(2, "0")}.webp`;
    pending.push(
      image
        .decode()
        .then(() => {
          if (isActive() && current() === index) {
            draw(index);
          }
        })
        .catch(() => undefined),
    );
    return image;
  });
  void Promise.all(pending).then(() => {
    if (!isActive()) {
      return;
    }
    canvas.dataset.framesReady = "true";
    canvas.dispatchEvent(new Event("laptop-frames-ready"));
  });
  return frames;
}

export function useLaptopFrames() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    let active = true;
    const draw = (index: number) => {
      currentRef.current = index;
      const frame = framesRef.current[index];
      if (!frame?.complete || !frame.naturalWidth) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(frame, 0, 0, canvas.width, canvas.height);
      canvas.dataset.frame = String(index);
    };
    framesRef.current = loadFrames(
      canvas,
      draw,
      () => active,
      () => currentRef.current,
    );
    const onFrame = (event: Event) =>
      draw((event as CustomEvent<number>).detail);
    canvas.addEventListener("laptop-frame", onFrame);
    draw(0);
    return () => {
      active = false;
      canvas.removeEventListener("laptop-frame", onFrame);
    };
  }, []);

  return canvasRef;
}
