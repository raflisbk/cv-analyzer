import { loadThree, type ThreeKit } from "@/lib/three-loader";
import { containScreen, screenSize } from "@/lib/landing-laptop-screen";
import type { Fit } from "@/lib/landing-laptop-camera";
import { LAPTOP_PROGRESS_EVENT } from "./progress-event";
import type { LaptopRenderer } from "./scene";

export type LaptopStatus = "ready" | "failed";

const PRELOAD_MARGIN = "100% 0px 100% 0px";
const SCREEN_ASPECT = screenSize.width / screenSize.height;

function measureFit(host: HTMLElement, panel: HTMLElement): Fit | null {
  const anchor = panel.querySelector<HTMLElement>("[data-laptop-anchor]");
  const canvas = host.getBoundingClientRect();
  if (!anchor || canvas.width === 0 || canvas.height === 0) {
    return null;
  }
  const rest = anchor.getBoundingClientRect();
  return {
    canvas: { width: canvas.width, height: canvas.height },
    rest: {
      x: rest.left - canvas.left,
      y: rest.top - canvas.top,
      width: rest.width,
      height: rest.height,
    },
    screenWidth: containScreen(canvas.width, canvas.height, SCREEN_ASPECT)
      .width,
  };
}

function observeIntersection(
  panel: HTMLElement,
  options: IntersectionObserverInit,
  onChange: (intersecting: boolean) => void,
) {
  const observer = new IntersectionObserver(
    (entries) => onChange(entries.some((entry) => entry.isIntersecting)),
    options,
  );
  observer.observe(panel);
  return observer;
}

interface LaptopState {
  disposed: boolean;
  visible: boolean;
  frame: number;
  progress: number;
  renderer: LaptopRenderer | null;
  canvas: HTMLCanvasElement | null;
}

function drawFrame(state: LaptopState, host: HTMLElement, panel: HTMLElement) {
  state.frame = 0;
  const fit = measureFit(host, panel);
  if (!state.renderer || !state.visible || !fit) {
    return;
  }
  state.renderer.render(state.progress, fit);
  const { geometries, textures } = state.renderer.stats();
  host.dataset.glGeometries = String(geometries);
  host.dataset.glTextures = String(textures);
}

type SceneModule = typeof import("./scene");

function attachRenderer(
  state: LaptopState,
  host: HTMLElement,
  [kit, scene]: [ThreeKit, SceneModule],
  label: string,
  request: () => void,
) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", label);
  host.appendChild(canvas);
  const renderer = scene.createLaptopRenderer(
    kit,
    canvas,
    host.clientWidth,
    request,
  );
  if (!renderer) {
    canvas.remove();
    return false;
  }
  state.canvas = canvas;
  state.renderer = renderer;
  return true;
}

export function mountLaptopController(
  host: HTMLElement,
  panel: HTMLElement,
  label: string,
  onStatus: (status: LaptopStatus) => void,
) {
  const state: LaptopState = {
    disposed: false,
    visible: false,
    frame: 0,
    progress: Number(panel.dataset.laptopScene || 0),
    renderer: null,
    canvas: null,
  };
  const request = () => {
    if (!state.frame && !state.disposed) {
      state.frame = requestAnimationFrame(() => drawFrame(state, host, panel));
    }
  };
  const resize = () => {
    if (state.renderer && host.clientWidth > 0 && host.clientHeight > 0) {
      state.renderer.resize(host.clientWidth, host.clientHeight);
      request();
    }
  };
  const resizeObserver = new ResizeObserver(resize);
  const onProgress = (event: Event) => {
    state.progress = (event as CustomEvent<{ scene: number }>).detail.scene;
    request();
  };
  const build = (modules: [ThreeKit, SceneModule]) => {
    if (state.disposed) {
      return;
    }
    if (!attachRenderer(state, host, modules, label, request)) {
      onStatus("failed");
      return;
    }
    resize();
    resizeObserver.observe(host);
    onStatus("ready");
  };
  let started = false;
  const preload = observeIntersection(
    panel,
    { rootMargin: PRELOAD_MARGIN },
    (near) => {
      if (near && !started) {
        started = true;
        Promise.all([loadThree(), import("./scene")])
          .then(build)
          .catch(() => !state.disposed && onStatus("failed"));
      }
    },
  );
  const watch = observeIntersection(panel, {}, (visible) => {
    state.visible = visible;
    if (visible) {
      request();
    }
  });
  panel.addEventListener(LAPTOP_PROGRESS_EVENT, onProgress);
  return () => {
    state.disposed = true;
    cancelAnimationFrame(state.frame);
    panel.removeEventListener(LAPTOP_PROGRESS_EVENT, onProgress);
    preload.disconnect();
    watch.disconnect();
    resizeObserver.disconnect();
    state.renderer?.dispose();
    state.canvas?.remove();
  };
}
