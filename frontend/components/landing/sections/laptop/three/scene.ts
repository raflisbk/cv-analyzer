import type { Material, Mesh, Texture, WebGLRenderer } from "three";
import type { ThreeKit } from "@/lib/three-loader";
import { FIELD_OF_VIEW } from "@/lib/landing-laptop-model";
import { cameraPose, type Fit } from "@/lib/landing-laptop-camera";
import { applyProgress, keysForText, type AnimatedParts } from "./animation";
import { buildBody } from "./body";
import { buildKeyboard } from "./keyboard";
import { buildLid } from "./lid";
import { buildEnvironment, buildLighting } from "./lighting";
import { createMaterials } from "./materials";
import { createRenderer, isCompact, pixelRatioFor } from "./renderer";
import { createScreenSurface } from "./screen-canvas";

export interface LaptopRenderer {
  render: (progress: number, fit: Fit) => void;
  resize: (width: number, height: number) => void;
  stats: () => { geometries: number; textures: number };
  dispose: () => void;
}

function disposeMaterial(material: Material) {
  Object.values(material).forEach((value) => {
    if (value && (value as Texture).isTexture) {
      (value as Texture).dispose();
    }
  });
  material.dispose();
}

function disposeObjects(scene: import("three").Scene) {
  scene.traverse((object) => {
    const mesh = object as Mesh;
    mesh.geometry?.dispose();
    [mesh.material]
      .flat()
      .forEach((material) => material && disposeMaterial(material));
  });
}

function assemble(
  kit: ThreeKit,
  renderer: WebGLRenderer,
  width: number,
  onAssetReady: () => void,
) {
  const scene = new kit.THREE.Scene();
  const environment = buildEnvironment(kit, renderer, scene);
  const { screenLight, ground } = buildLighting(kit, scene, isCompact(width));
  const materials = createMaterials(kit);
  const laptop = new kit.THREE.Group();
  scene.add(laptop);
  const trackpad = buildBody(kit, materials, laptop);
  const { keys, legendMaterials } = buildKeyboard(kit, materials, laptop);
  const surface = createScreenSurface(kit, onAssetReady);
  const { lid, ledMaterial } = buildLid(
    kit,
    materials,
    laptop,
    surface.texture,
  );
  const parts: AnimatedParts = {
    lid,
    keys,
    legendMaterials,
    ledMaterial,
    trackpad,
    screenLight,
    ground,
    drawScreen: surface.draw,
  };
  return { scene, environment, surface, parts, textKeys: keysForText(keys) };
}

export function createLaptopRenderer(
  kit: ThreeKit,
  canvas: HTMLCanvasElement,
  width: number,
  onAssetReady: () => void,
): LaptopRenderer | null {
  const renderer = createRenderer(kit, canvas);
  if (!renderer) {
    return null;
  }
  const { scene, environment, surface, parts, textKeys } = assemble(
    kit,
    renderer,
    width,
    onAssetReady,
  );
  const camera = new kit.THREE.PerspectiveCamera(FIELD_OF_VIEW, 1, 20, 400);
  let size = { width: 1, height: 1 };
  return {
    render(progress, fit) {
      applyProgress(parts, textKeys, progress);
      const pose = cameraPose(progress, fit);
      camera.position.set(...pose.position);
      camera.lookAt(...pose.target);
      camera.setViewOffset(
        size.width,
        size.height,
        -pose.shift.x,
        -pose.shift.y,
        size.width,
        size.height,
      );
      renderer.render(scene, camera);
    },
    resize(nextWidth, nextHeight) {
      size = { width: nextWidth, height: nextHeight };
      renderer.setPixelRatio(pixelRatioFor(nextWidth));
      renderer.setSize(nextWidth, nextHeight, false);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    },
    stats: () => ({
      geometries: renderer.info.memory.geometries,
      textures: renderer.info.memory.textures,
    }),
    dispose() {
      surface.dispose();
      disposeObjects(scene);
      scene.environment = null;
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
